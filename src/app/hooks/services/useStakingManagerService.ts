import {
  BabylonBtcStakingManager,
  SigningStep,
} from "@babylonlabs-io/btc-staking-ts";
import { SignPsbtOptions } from "@babylonlabs-io/wallet-connector";
import { EventEmitter } from "events";
import { useCallback, useEffect, useRef } from "react";

import { useTransaction } from "@/app/context/transaction/TransactionProvider";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useNetworkInfo } from "@/app/hooks/client/api/useNetworkInfo";
import { useBbnTransaction } from "@/app/hooks/client/rpc/mutation/useBbnTransaction";
import { useAppState } from "@/app/state";
import { useLogger } from "@/hooks/useLogger";

const stakingManagerEvents = {
  SIGNING: "signing",
} as const;

export const useStakingManagerService = () => {
  const { networkInfo } = useAppState();
  const { signBbnTx } = useBbnTransaction();
  const { data: networkInfoAPI } = useNetworkInfo();
  const logger = useLogger();

  const { connected: cosmosConnected } = useCosmosWallet();
  const {
    network: btcNetwork,
    connected: btcConnected,
    signPsbt,
    signMessage,
    publicKeyNoCoord,
  } = useBTCWallet();
  const { bech32Address } = useCosmosWallet();

  const versionedParams = networkInfo?.params.bbnStakingParams?.versions;

  const { current: eventEmitter } = useRef<EventEmitter>(new EventEmitter());

  const { transactionData, setTransactionData } = useTransaction();

  // Ref to keep the latest transaction data and avoid infinite state update
  const transactionDataRef = useRef(transactionData);
  useEffect(() => {
    transactionDataRef.current = transactionData;
  }, [transactionData]);

  useEffect(() => {
    setTransactionData({
      publicKeyNoCoord,
      bbnAddress: bech32Address,
      unbondingTimelock:
        networkInfoAPI?.params.bbnStakingParams.latestParam.unbondingTime,
      covenantNoCoordPks:
        networkInfoAPI?.params.bbnStakingParams.latestParam.covenantNoCoordPks,
      covenantQuorum:
        networkInfoAPI?.params.bbnStakingParams.latestParam.covenantQuorum,
    });
  }, [networkInfoAPI, publicKeyNoCoord, setTransactionData, bech32Address]);

  const createBtcStakingManager = useCallback(
    (
      finalityProviderPK?: string,
      stakingTimelock?: number,
      unbondingTimelock?: number,
    ) => {
      if (
        !btcNetwork ||
        !cosmosConnected ||
        !btcConnected ||
        !signPsbt ||
        !signMessage ||
        !signBbnTx ||
        !versionedParams ||
        versionedParams.length === 0
      ) {
        logger.info("createBtcStakingManager", {
          cosmosConnected,
          btcConnected,
          btcNetwork: Boolean(btcNetwork),
          signPsbt: Boolean(signPsbt),
          signMessage: Boolean(signMessage),
          signBbnTx: Boolean(signBbnTx),
          versionedParams: Boolean(versionedParams),
        });
        return null;
      }

      if (unbondingTimelock !== undefined) {
        setTransactionData({
          ...transactionDataRef.current,
          unbondingTimelock,
        });
      }

      const btcProvider = {
        signPsbt: async (signingStep: SigningStep, psbt: string) => {
          setTransactionData({ currentStep: signingStep });
          eventEmitter.emit(stakingManagerEvents.SIGNING, signingStep);

          // Use ref for latest transaction data
          const currentTransactionData = transactionDataRef.current;

          const options: SignPsbtOptions = {
            contracts: [
              {
                id: "babylon:staking",
                params: {
                  type: signingStep,
                  stakerPk: currentTransactionData.publicKeyNoCoord as string,
                  finalityProviders: [
                    finalityProviderPK ||
                      (currentTransactionData.finalityProviderPK as string),
                  ],
                  covenantPks:
                    currentTransactionData.covenantNoCoordPks as string[],
                  covenantThreshold:
                    currentTransactionData.covenantQuorum as number,
                  minUnbondingTime:
                    unbondingTimelock ||
                    (currentTransactionData.unbondingTimelock as number),
                  stakingDuration:
                    stakingTimelock ||
                    (currentTransactionData.stakingTimelock as number),
                  magicBytes: "62627434", // TODO We don't need this, but parsing the contract won't work without it
                },
              },
            ],
          };
          return signPsbt(psbt, options);
        },
        signMessage: async (
          signingStep: SigningStep,
          message: string,
          type: "ecdsa" | "bip322-simple",
        ) => {
          setTransactionData({ currentStep: signingStep });
          eventEmitter.emit(stakingManagerEvents.SIGNING, signingStep);
          return signMessage(message, type);
        },
      };

      const bbnProvider = {
        signTransaction: async <T extends object>(
          signingStep: SigningStep,
          msg: {
            typeUrl: string;
            value: T;
          },
        ) => {
          setTransactionData({ currentStep: signingStep });
          eventEmitter.emit(stakingManagerEvents.SIGNING, signingStep);
          return signBbnTx(msg);
        },
      };

      return new BabylonBtcStakingManager(
        btcNetwork,
        versionedParams,
        btcProvider,
        bbnProvider,
      );
    },
    [
      btcNetwork,
      cosmosConnected,
      btcConnected,
      signPsbt,
      signMessage,
      signBbnTx,
      versionedParams,
      eventEmitter,
      setTransactionData,
      logger,
    ],
  );

  const on = useCallback(
    (callback: (step: SigningStep) => void) => {
      eventEmitter.on(stakingManagerEvents.SIGNING, callback);
    },
    [eventEmitter],
  );

  const off = useCallback(
    (callback: (step: SigningStep) => void) => {
      eventEmitter.off(stakingManagerEvents.SIGNING, callback);
    },
    [eventEmitter],
  );

  return {
    createBtcStakingManager,
    on,
    off,
  };
};

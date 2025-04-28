import {
  BabylonBtcStakingManager,
  SigningStep,
} from "@babylonlabs-io/btc-staking-ts";
import { SignPsbtOptions } from "@babylonlabs-io/wallet-connector";
import { EventEmitter } from "events";
import { useCallback, useRef } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/app/hooks/client/rpc/mutation/useBbnTransaction";
import { useAppState } from "@/app/state";

import { useNetworkInfo } from "../client/api/useNetworkInfo";

const stakingManagerEvents = {
  SIGNING: "signing",
} as const;

export const useStakingManagerService = () => {
  const { networkInfo } = useAppState();
  const { signBbnTx } = useBbnTransaction();
  const { data: networkInfoAPI } = useNetworkInfo();

  const { connected: cosmosConnected } = useCosmosWallet();
  const {
    network: btcNetwork,
    connected: btcConnected,
    publicKeyNoCoord,
    signPsbt,
    signMessage,
  } = useBTCWallet();

  const versionedParams = networkInfo?.params.bbnStakingParams?.versions;

  const { current: eventEmitter } = useRef<EventEmitter>(new EventEmitter());

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
        return null;
      }

      const btcProvider = {
        signPsbt: async (signingStep: SigningStep, psbt: string) => {
          console.log("signingStep", signingStep);
          console.log("psbt", psbt);
          eventEmitter.emit(stakingManagerEvents.SIGNING, signingStep);
          const { covenantNoCoordPks, covenantQuorum } =
            networkInfoAPI!.params.bbnStakingParams.latestParam;
          const options: SignPsbtOptions = {
            contracts: [
              {
                id: "babylon:staking",
                params: {
                  type: signingStep,
                  stakerPk: publicKeyNoCoord,
                  finalityProviders: [finalityProviderPK as string],
                  covenantPks: covenantNoCoordPks,
                  covenantThreshold: covenantQuorum,
                  minUnbondingTime: unbondingTimelock as number,
                  stakingDuration: stakingTimelock as number,
                  magicBytes: "62627434", // TODO do we need this?
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
      networkInfoAPI,
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

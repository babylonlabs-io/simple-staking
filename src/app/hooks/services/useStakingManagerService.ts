import {
  BabylonBtcStakingManager,
  SigningStep,
} from "@babylonlabs-io/btc-staking-ts";
import { EventEmitter } from "events";
import { useCallback, useRef } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useNetworkInfo } from "@/app/hooks/client/api/useNetworkInfo";
import { useBbnTransaction } from "@/app/hooks/client/rpc/mutation/useBbnTransaction";
import { useComposedSignOptionsData } from "@/app/hooks/useComposedSignOptions";
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

  const { getSignPsbtOptions } = useComposedSignOptionsData();

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

      const btcProvider = {
        signPsbt: async (signingStep: SigningStep, psbt: string) => {
          eventEmitter.emit(stakingManagerEvents.SIGNING, signingStep);

          const options = getSignPsbtOptions(signingStep);

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
      logger,
      getSignPsbtOptions,
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

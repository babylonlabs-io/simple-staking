import {
  BabylonBtcStakingManager,
  SigningStep,
  type SignPsbtOptions,
} from "@babylonlabs-io/btc-staking-ts";
import { useCallback } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/app/hooks/client/rpc/mutation/useBbnTransaction";
import { useEventBus, type EventBusEvents } from "@/app/hooks/useEventBus";
import { useLogger } from "@/app/hooks/useLogger";
import { useAppState } from "@/app/state";

export const useStakingManagerService = () => {
  const { networkInfo } = useAppState();
  const { signBbnTx } = useBbnTransaction();
  const logger = useLogger();
  const eventBus = useEventBus();

  const { connected: cosmosConnected } = useCosmosWallet();
  const {
    network: btcNetwork,
    connected: btcConnected,
    signPsbt,
    signMessage,
  } = useBTCWallet();

  const versionedParams = networkInfo?.params.bbnStakingParams?.versions;

  const isLoading =
    !btcNetwork ||
    !cosmosConnected ||
    !btcConnected ||
    !signPsbt ||
    !signMessage ||
    !signBbnTx ||
    !versionedParams ||
    versionedParams.length === 0;

  const createBtcStakingManager = useCallback(
    (eventChannel?: keyof EventBusEvents) => {
      if (isLoading) {
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
        signPsbt: async (
          signingStep: SigningStep,
          psbt: string,
          options?: SignPsbtOptions,
        ) => {
          if (eventChannel) {
            eventBus.emit(eventChannel, signingStep, options);
          }

          return signPsbt(psbt, options);
        },
        signMessage: async (
          signingStep: SigningStep,
          message: string,
          type: "ecdsa" | "bip322-simple",
        ) => {
          if (eventChannel) {
            eventBus.emit(eventChannel, signingStep);
          }

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
          if (eventChannel) {
            eventBus.emit(eventChannel, signingStep);
          }

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
      isLoading,
      btcNetwork,
      versionedParams,
      logger,
      cosmosConnected,
      btcConnected,
      signPsbt,
      signMessage,
      signBbnTx,
      eventBus,
    ],
  );

  return {
    isLoading,
    createBtcStakingManager,
  };
};

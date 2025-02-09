import {
  BabylonBtcStakingManager,
  SigningStep,
} from "@babylonlabs-io/btc-staking-ts";
import { EventEmitter } from "events";
import { useCallback, useRef } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/app/hooks/client/rpc/mutation/useBbnTransaction";
import { useAppState } from "@/app/state";

const stakingManagerEvents = {
  SIGNING: "signing",
} as const;

export const useStakingManagerService = () => {
  const { networkInfo } = useAppState();
  const { signBbnTx } = useBbnTransaction();

  const { connected: cosmosConnected } = useCosmosWallet();
  const {
    network: btcNetwork,
    connected: btcConnected,
    signPsbt,
    signMessage,
  } = useBTCWallet();

  const versionedParams = networkInfo?.params.bbnStakingParams?.versions;

  const { current: eventEmitter } = useRef<EventEmitter>(new EventEmitter());

  const createBtcStakingManager = useCallback(() => {
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
        eventEmitter.emit(stakingManagerEvents.SIGNING, signingStep);
        return signPsbt(psbt);
      },
      signMessage: async (
        signingStep: SigningStep,
        message: string,
        type: "ecdsa",
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
  }, [
    btcNetwork,
    cosmosConnected,
    btcConnected,
    signPsbt,
    signMessage,
    signBbnTx,
    versionedParams,
    eventEmitter,
  ]);

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

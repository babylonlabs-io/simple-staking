import {
  BabylonBtcStakingManager,
  SigningStep,
} from "@babylonlabs-io/btc-staking-ts";
import { EventEmitter } from "events";
import { useCallback, useEffect, useRef, useState } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/app/hooks/client/rpc/mutation/useBbnTransaction";
import { useAppState } from "@/app/state";
import { useLogger } from "@/hooks/useLogger";

const stakingManagerEvents = {
  SIGNING: "signing",
} as const;

const RETRY_DELAY = 2000;

export const useStakingManagerService = () => {
  const { networkInfo } = useAppState();
  const { signBbnTx } = useBbnTransaction();
  const logger = useLogger();

  const { connected: cosmosConnected } = useCosmosWallet();
  const {
    network: btcNetwork,
    connected: btcConnected,
    signPsbt,
    signMessage,
  } = useBTCWallet();

  const versionedParams = networkInfo?.params.bbnStakingParams?.versions;

  const { current: eventEmitter } = useRef<EventEmitter>(new EventEmitter());
  const [stakingManager, setStakingManager] =
    useState<BabylonBtcStakingManager | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const createBtcStakingManager = useCallback(() => {
    if (stakingManager) return stakingManager;

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
        return signPsbt(psbt);
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

    const manager = new BabylonBtcStakingManager(
      btcNetwork,
      versionedParams,
      btcProvider,
      bbnProvider,
    );

    setStakingManager(manager);
    return manager;
  }, [
    btcNetwork,
    cosmosConnected,
    btcConnected,
    signPsbt,
    signMessage,
    signBbnTx,
    versionedParams,
    eventEmitter,
    stakingManager,
  ]);

  useEffect(() => {
    const attemptCreateManager = () => {
      const manager = createBtcStakingManager();

      if (manager) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        timeoutRef.current = setTimeout(() => {
          attemptCreateManager();
        }, RETRY_DELAY);
      }
    };

    if (!stakingManager) {
      attemptCreateManager();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [createBtcStakingManager, logger, stakingManager]);

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
    stakingManager,
    on,
    off,
  };
};

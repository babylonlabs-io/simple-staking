import { BabylonBtcStakingManager } from "@babylonlabs-io/btc-staking-ts";
import { useCallback } from "react";

import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";
import { useEventBus } from "@/ui/common/hooks/useEventBus";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useAppState } from "@/ui/common/state";

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

  const createBtcStakingManager = useCallback(() => {
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
      signPsbt,
      signMessage,
    };

    const bbnProvider = {
      signTransaction: signBbnTx,
    };

    return new BabylonBtcStakingManager(
      btcNetwork,
      versionedParams,
      btcProvider,
      bbnProvider,
      eventBus,
    );
  }, [
    isLoading,
    btcNetwork,
    versionedParams,
    logger,
    cosmosConnected,
    btcConnected,
    eventBus,
    signPsbt,
    signMessage,
    signBbnTx,
  ]);

  return {
    isLoading,
    createBtcStakingManager,
  };
};

import { BabylonBtcStakingManager } from "@babylonlabs-io/btc-staking-ts";
import { useCallback, useMemo } from "react";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";
import { useBbnQuery } from "@/ui/common/hooks/client/rpc/queries/useBbnQuery";
import { useEventBus } from "@/ui/common/hooks/useEventBus";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useAppState } from "@/ui/common/state";
import { getTxHex } from "@/ui/common/utils/mempool_api";

export const useStakingManagerService = () => {
  const { networkInfo } = useAppState();
  const { signBbnTx } = useBbnTransaction();
  const {
    babyTipQuery: { data: bbnHeight = 0 },
  } = useBbnQuery();
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

  const networkUpgrade = useMemo(() => {
    const popUpgrade = networkInfo?.networkUpgrade?.pop?.[0];
    return popUpgrade
      ? {
          pop: {
            upgradeHeight: popUpgrade.height,
            version: popUpgrade.version,
          },
        }
      : undefined;
  }, [networkInfo?.networkUpgrade]);

  const { chainId } = getNetworkConfigBBN();

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
      getTransactionHex: getTxHex,
    };

    const bbnProvider = {
      signTransaction: signBbnTx,
      getCurrentHeight: async () => {
        return bbnHeight;
      },
      getChainId: async () => chainId,
    };

    return new BabylonBtcStakingManager(
      btcNetwork,
      versionedParams,
      btcProvider,
      bbnProvider,
      eventBus,
      networkUpgrade,
    );
  }, [
    isLoading,
    btcNetwork,
    versionedParams,
    networkUpgrade,
    bbnHeight,
    logger,
    cosmosConnected,
    btcConnected,
    eventBus,
    signPsbt,
    signMessage,
    signBbnTx,
    chainId,
  ]);

  return {
    isLoading,
    createBtcStakingManager,
  };
};

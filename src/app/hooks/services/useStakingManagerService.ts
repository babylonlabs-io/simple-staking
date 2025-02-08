import { BabylonBtcStakingManager } from "@babylonlabs-io/btc-staking-ts";
import { useMemo } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/app/hooks/client/rpc/mutation/useBbnTransaction";
import { useAppState } from "@/app/state";

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

  const btcStakingManager = useMemo(() => {
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
      signPsbt,
      signMessage,
    };

    const bbnProvider = {
      signTransaction: async <T extends object>(msg: {
        typeUrl: string;
        value: T;
      }) => signBbnTx(msg),
    };

    return new BabylonBtcStakingManager(
      btcNetwork,
      versionedParams,
      btcProvider,
      bbnProvider,
    );
  }, [
    btcNetwork,
    versionedParams,
    cosmosConnected,
    btcConnected,
    signPsbt,
    signMessage,
    signBbnTx,
  ]);
  return {
    btcStakingManager,
  };
};

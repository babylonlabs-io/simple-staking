import { useCallback } from "react";

import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";

import { useBbnQuery } from "../client/query/useBbnQuery";

export const useRewardsService = () => {
  const {
    connected: cosmosConnected,
    bech32Address,
    signingStargateClient,
  } = useCosmosWallet();

  const { getRewards: getBbnRewards } = useBbnQuery();

  const getRewards = useCallback(async (): Promise<number> => {
    if (!cosmosConnected || !bech32Address || !signingStargateClient) {
      return 0;
    }
    return getBbnRewards();
  }, [cosmosConnected, bech32Address, signingStargateClient, getBbnRewards]);

  const claimRewards = useCallback(async () => {
    throw new Error("Not implemented");
  }, []);

  return {
    getRewards,
    claimRewards,
  };
};

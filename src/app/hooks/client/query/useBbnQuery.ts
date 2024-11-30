import { incentivequery } from "@babylonlabs-io/babylon-proto-ts";
import { QueryClient, createProtobufRpcClient } from "@cosmjs/stargate";
import { useCallback } from "react";

import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";

const REWARD_GAUGE_KEY_BTC_DELEGATION = "btc_delegation";

/**
 * Query service for Babylon which contains all the queries for
 * interacting with Babylon RPC nodes
 */
export const useBbnQuery = () => {
  const { queryClient, bech32Address } = useCosmosWallet();

  const getRewards = useCallback(async (): Promise<number> => {
    if (!queryClient || !bech32Address) {
      return 0;
    }
    const { incentive } = setupIncentiveExtension(queryClient);

    const req: incentivequery.QueryRewardGaugesRequest =
      incentivequery.QueryRewardGaugesRequest.fromPartial({
        address: bech32Address,
      });

    const { rewardGauges } = await incentive.RewardGauges(req);
    const btcDelegationRewards =
      rewardGauges[REWARD_GAUGE_KEY_BTC_DELEGATION]?.coins;
    if (!btcDelegationRewards) {
      return 0;
    }

    return btcDelegationRewards.reduce(
      (acc, coin) => acc + Number(coin.amount),
      0,
    );
  }, [queryClient, bech32Address]);

  return {
    getRewards,
  };
};

// Extend the QueryClient with the Incentive module
const setupIncentiveExtension = (
  base: QueryClient,
): {
  incentive: incentivequery.QueryClientImpl;
} => {
  const rpc = createProtobufRpcClient(base);
  const incentiveQueryClient = new incentivequery.QueryClientImpl(rpc);
  return { incentive: incentiveQueryClient };
};

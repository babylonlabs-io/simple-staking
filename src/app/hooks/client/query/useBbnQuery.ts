import { incentivequery } from "@babylonlabs-io/babylon-proto-ts";
import { QueryClient, createProtobufRpcClient } from "@cosmjs/stargate";
import { useCallback } from "react";

import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";

/**
 * Query service for Babylon which contains all the queries for
 * interacting with Babylon RPC nodes
 */
export const useBbnQuery = () => {
  const { queryClient, bech32Address } = useCosmosWallet();

  const getRewards = useCallback(async (): Promise<
    incentivequery.QueryRewardGaugesResponse | undefined
  > => {
    if (!queryClient || !bech32Address) {
      return undefined;
    }
    const { incentive } = setupIncentiveExtension(queryClient);

    const req: incentivequery.QueryRewardGaugesRequest =
      incentivequery.QueryRewardGaugesRequest.fromPartial({
        address: bech32Address,
      });

    return incentive.RewardGauges(req);
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

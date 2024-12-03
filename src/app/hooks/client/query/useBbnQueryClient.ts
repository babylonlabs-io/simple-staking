import { incentivequery } from "@babylonlabs-io/babylon-proto-ts";
import {
  QueryClient,
  createProtobufRpcClient,
  setupBankExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { useCallback, useEffect, useState } from "react";

import { BBN_RPC_URL } from "@/app/common/rpc";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";

/**
 * Query service for Babylon which contains all the queries for
 * interacting with Babylon RPC nodes
 */
export const useBbnQueryClient = () => {
  const { bech32Address, connected } = useCosmosWallet();
  const [queryClient, setQueryClient] = useState<QueryClient>();

  useEffect(() => {
    const initQueryClient = async () => {
      const tmClient = await Tendermint34Client.connect(BBN_RPC_URL);
      const queryClient = QueryClient.withExtensions(tmClient);
      setQueryClient(queryClient);
    };

    initQueryClient();
  }, []);

  /**
   * Gets the rewards from the user's account.
   * @returns {Promise<Object>} - The rewards from the user's account.
   */
  const getRewards = useCallback(async (): Promise<
    incentivequery.QueryRewardGaugesResponse | undefined
  > => {
    if (!connected || !queryClient || !bech32Address) {
      return undefined;
    }
    const { incentive } = setupIncentiveExtension(queryClient);

    const req: incentivequery.QueryRewardGaugesRequest =
      incentivequery.QueryRewardGaugesRequest.fromPartial({
        address: bech32Address,
      });

    return incentive.RewardGauges(req);
  }, [connected, queryClient, bech32Address]);

  const getBalance = useCallback(async (): Promise<number> => {
    if (!connected || !queryClient || !bech32Address) {
      return 0;
    }

    const { bank } = setupBankExtension(queryClient);
    const balance = await bank.balance(bech32Address, "ubbn");
    return Number(balance?.amount ?? 0);
  }, [connected, queryClient, bech32Address]);

  return {
    getRewards,
    getBalance,
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

import {
  btclightclientquery,
  incentivequery,
} from "@babylonlabs-io/babylon-proto-ts";
import {
  QueryClient,
  createProtobufRpcClient,
  setupBankExtension,
} from "@cosmjs/stargate";

import { ONE_MINUTE } from "@/app/constants";
import { useBbnRpc } from "@/app/context/rpc/BbnRpcProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";

import { useClientQuery } from "../../useClient";

const BBN_BTCLIGHTCLIENT_TIP_KEY = "BBN_BTCLIGHTCLIENT_TIP";
const BBN_BALANCE_KEY = "BBN_BALANCE";
const BBN_REWARDS_KEY = "BBN_REWARDS";
const REWARD_GAUGE_KEY_BTC_DELEGATION = "btc_delegation";

/**
 * Query service for Babylon which contains all the queries for
 * interacting with Babylon RPC nodes
 */
export const useBbnQuery = () => {
  const { bech32Address, connected } = useCosmosWallet();
  const { queryClient } = useBbnRpc();

  /**
   * Gets the rewards from the user's account.
   * @returns {Promise<number>} - The rewards from the user's account.
   */
  const rewardsQuery = useClientQuery({
    queryKey: [BBN_REWARDS_KEY, bech32Address],
    queryFn: async () => {
      if (!connected || !queryClient || !bech32Address) {
        return undefined;
      }
      const { incentive } = setupIncentiveExtension(queryClient);
      const req: incentivequery.QueryRewardGaugesRequest =
        incentivequery.QueryRewardGaugesRequest.fromPartial({
          address: bech32Address,
        });

      let rewards: incentivequery.QueryRewardGaugesResponse;
      try {
        rewards = await incentive.RewardGauges(req);
      } catch (error) {
        // If error message contains "reward gauge not found", silently return 0
        // This is to handle the case where the user has no rewards, meaning
        // they have not staked
        if (
          error instanceof Error &&
          error.message.includes("reward gauge not found")
        ) {
          return 0;
        }
        throw error;
      }
      if (!rewards) {
        return 0;
      }

      const coins =
        rewards.rewardGauges[REWARD_GAUGE_KEY_BTC_DELEGATION]?.coins;
      if (!coins) {
        return 0;
      }

      const withdrawnCoins = rewards.rewardGauges[
        REWARD_GAUGE_KEY_BTC_DELEGATION
      ]?.withdrawnCoins.reduce((acc, coin) => acc + Number(coin.amount), 0);

      return (
        coins.reduce((acc, coin) => acc + Number(coin.amount), 0) -
        (withdrawnCoins || 0)
      );
    },
    enabled: Boolean(queryClient && connected && bech32Address),
    staleTime: ONE_MINUTE,
    refetchInterval: ONE_MINUTE,
  });

  /**
   * Gets the balance of the user's account.
   * @returns {Promise<Object>} - The balance of the user's account.
   */
  const balanceQuery = useClientQuery({
    queryKey: [BBN_BALANCE_KEY, bech32Address],
    queryFn: async () => {
      if (!connected || !queryClient || !bech32Address) {
        return 0;
      }
      const { bank } = setupBankExtension(queryClient);
      const balance = await bank.balance(bech32Address, "ubbn");
      return Number(balance?.amount ?? 0);
    },
    enabled: Boolean(queryClient && connected && bech32Address),
    staleTime: ONE_MINUTE,
    refetchInterval: ONE_MINUTE,
  });

  /**
   * Gets the tip of the Bitcoin blockchain.
   * @returns {Promise<Object>} - The tip of the Bitcoin blockchain.
   */
  const btcTipQuery = useClientQuery({
    queryKey: [BBN_BTCLIGHTCLIENT_TIP_KEY],
    queryFn: async () => {
      if (!queryClient) {
        return undefined;
      }
      const { btclightQueryClient } = setupBtclightClientExtension(queryClient);
      const req = btclightclientquery.QueryTipRequest.fromPartial({});
      const { header } = await btclightQueryClient.Tip(req);
      return header;
    },
    enabled: Boolean(queryClient),
    staleTime: ONE_MINUTE,
    refetchInterval: false, // Disable automatic periodic refetching
  });

  return {
    rewardsQuery,
    balanceQuery,
    btcTipQuery,
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

const setupBtclightClientExtension = (
  base: QueryClient,
): {
  btclightQueryClient: btclightclientquery.QueryClientImpl;
} => {
  const rpc = createProtobufRpcClient(base);
  const btclightQueryClient = new btclightclientquery.QueryClientImpl(rpc);
  return { btclightQueryClient };
};

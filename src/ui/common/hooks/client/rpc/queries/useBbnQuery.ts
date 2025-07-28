import {
  btclightclientquery,
  incentivequery,
} from "@babylonlabs-io/babylon-proto-ts";
import {
  QueryClient,
  createProtobufRpcClient,
  setupBankExtension,
} from "@cosmjs/stargate";

import { ONE_MINUTE, ONE_SECOND } from "@/ui/common/constants";
import { useBbnRpc } from "@/ui/common/context/rpc/BbnRpcProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { ClientError } from "@/ui/common/errors";
import { ERROR_CODES } from "@/ui/common/errors/codes";
import { useHealthCheck } from "@/ui/common/hooks/useHealthCheck";

import { useClientQuery } from "../../useClient";
import { useRpcErrorHandler } from "../useRpcErrorHandler";

const BBN_BTCLIGHTCLIENT_TIP_KEY = "BBN_BTCLIGHTCLIENT_TIP";
const BBN_BALANCE_KEY = "BBN_BALANCE";
const BBN_REWARDS_KEY = "BBN_REWARDS";
const BBN_HEIGHT_KEY = "BBN_HEIGHT";
const REWARD_GAUGE_KEY_BTC_DELEGATION = "BTC_STAKER";

/**
 * Query service for Babylon which contains all the queries for
 * interacting with Babylon RPC nodes
 */
export const useBbnQuery = () => {
  const { isGeoBlocked, isLoading: isHealthcheckLoading } = useHealthCheck();
  const { bech32Address, connected } = useCosmosWallet();
  const { queryClient, tmClient } = useBbnRpc();
  const { hasRpcError, reconnect } = useRpcErrorHandler();

  /**
   * Gets the rewards from the user's account.
   * @returns {Promise<number>} - The rewards from the user's account.
   */
  const rewardsQuery = useClientQuery({
    queryKey: [BBN_REWARDS_KEY, bech32Address, connected],
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
        throw new ClientError(
          ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
          "Error getting rewards",
          { cause: error as Error },
        );
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
    enabled: Boolean(
      queryClient &&
        connected &&
        bech32Address &&
        !isGeoBlocked &&
        !isHealthcheckLoading,
    ),
    staleTime: ONE_MINUTE,
    refetchInterval: ONE_MINUTE,
  });

  /**
   * Gets the balance of the user's account.
   * @returns {Promise<Object>} - The balance of the user's account.
   */
  const balanceQuery = useClientQuery({
    queryKey: [BBN_BALANCE_KEY, bech32Address, connected],
    queryFn: async () => {
      if (!connected || !queryClient || !bech32Address) {
        return 0;
      }
      const { bank } = setupBankExtension(queryClient);
      const balance = await bank.balance(bech32Address, "ubbn");
      return Number(balance?.amount ?? 0);
    },
    enabled: Boolean(
      queryClient &&
        connected &&
        bech32Address &&
        !isGeoBlocked &&
        !isHealthcheckLoading,
    ),
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
    enabled: Boolean(queryClient && !isGeoBlocked && !isHealthcheckLoading),
    staleTime: ONE_MINUTE,
    refetchInterval: false, // Disable automatic periodic refetching
  });

  /**
   * Gets the current height of the Babylon Genesis chain.
   * @returns {Promise<number>} - The current height of the Babylon Genesis chain.
   */
  const babyTipQuery = useClientQuery({
    queryKey: [BBN_HEIGHT_KEY],
    queryFn: async () => {
      if (!tmClient) {
        return 0;
      }
      try {
        const status = await tmClient.status();
        return status.syncInfo.latestBlockHeight;
      } catch (error) {
        throw new ClientError(
          ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
          "Error getting Babylon chain height",
          { cause: error as Error },
        );
      }
    },
    enabled: Boolean(tmClient && connected),
    staleTime: ONE_SECOND * 10,
    refetchInterval: false, // Disable automatic periodic refetching
  });

  return {
    rewardsQuery,
    balanceQuery,
    btcTipQuery,
    babyTipQuery,
    hasRpcError,
    reconnectRpc: reconnect,
    queryClient,
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

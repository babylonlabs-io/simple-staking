import { createRPCClient } from "@babylonlabs-io/babylon-proto-ts";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { ONE_MINUTE, ONE_SECOND } from "@/ui/common/constants";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useHealthCheck } from "@/ui/common/hooks/useHealthCheck";

import { useClientQuery } from "../../useClient";

const BBN_BTCLIGHTCLIENT_TIP_KEY = "BBN_BTCLIGHTCLIENT_TIP";
const BBN_BALANCE_KEY = "BBN_BALANCE";
const BBN_REWARDS_KEY = "BBN_REWARDS";
const BBN_HEIGHT_KEY = "BBN_HEIGHT";
const { rpc: BBN_RPC_URL } = getNetworkConfigBBN();

/**
 * Query service for Babylon which contains all the queries for
 * interacting with Babylon RPC nodes
 */
export const useBbnQuery = () => {
  const { isGeoBlocked, isLoading: isHealthcheckLoading } = useHealthCheck();
  const { bech32Address, connected } = useCosmosWallet();

  /**
   * Gets the rewards from the user's account.
   * @returns {Promise<number>} - The rewards from the user's account.
   */
  const rewardsQuery = useClientQuery({
    queryKey: [BBN_REWARDS_KEY, bech32Address, connected],
    queryFn: async () => {
      if (!connected || !bech32Address) {
        return undefined;
      }
      const { btc } = await createRPCClient({ url: BBN_RPC_URL });
      const rewards = await btc.getRewards(bech32Address);
      return rewards;
    },
    enabled: Boolean(
      connected && bech32Address && !isGeoBlocked && !isHealthcheckLoading,
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
      if (!connected || !bech32Address) {
        return 0;
      }
      const { baby } = await createRPCClient({ url: BBN_RPC_URL });
      const balance = await baby.getBalance(bech32Address);
      return Number(balance);
    },
    enabled: Boolean(
      connected && bech32Address && !isGeoBlocked && !isHealthcheckLoading,
    ),
    staleTime: ONE_MINUTE,
    refetchInterval: ONE_MINUTE,
  });

  /**
   * Gets the tip of the Bitcoin blockchain.
   * @returns {Promise<Object>} - The tip of the Bitcoin blockchain.
   */
  const btcTipHeightQuery = useClientQuery({
    queryKey: [BBN_BTCLIGHTCLIENT_TIP_KEY],
    queryFn: async () => {
      const { btc } = await createRPCClient({ url: BBN_RPC_URL });
      const height = await btc.getBTCTipHeight();
      return height;
    },
    enabled: !isGeoBlocked && !isHealthcheckLoading,
    staleTime: ONE_MINUTE,
    refetchInterval: false, // Disable automatic periodic refetching
  });

  /**
   * Gets the current height of the Babylon Genesis chain.
   * @returns {Promise<number>} - The current height of the Babylon Genesis chain.
   */
  const babyTipHeightQuery = useClientQuery({
    queryKey: [BBN_HEIGHT_KEY],
    queryFn: async () => {
      const { baby } = await createRPCClient({ url: BBN_RPC_URL });
      const height = await baby.getBlockHeight();
      return height;
    },
    enabled: connected,
    staleTime: ONE_SECOND * 10,
    refetchInterval: false, // Disable automatic periodic refetching
  });

  return {
    rewardsQuery,
    balanceQuery,
    btcTipHeightQuery,
    babyTipHeightQuery,
  };
};

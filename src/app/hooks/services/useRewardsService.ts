import { incentivetx } from "@babylonlabs-io/babylon-proto-ts";
import { useCallback } from "react";

import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { BBN_REGISTRY_TYPE_URLS } from "@/utils/wallet/bbnRegistry";

import { useBbnQueryClient } from "../client/query/useBbnQueryClient";
import { useBbnTransaction } from "../client/query/useBbnTransaction";

const REWARD_GAUGE_KEY_BTC_DELEGATION = "btc_delegation";

export const useRewardsService = () => {
  const {
    connected: cosmosConnected,
    bech32Address,
    signingStargateClient,
  } = useCosmosWallet();

  const { getRewards: getBbnRewards } = useBbnQueryClient();
  const { estimateBbnGasFee, sendBbnTx } = useBbnTransaction();

  /**
   * Gets the rewards from the user's account.
   * @returns {Promise<number>} The rewards from the user's account.
   */
  const getRewards = useCallback(async (): Promise<number> => {
    if (!cosmosConnected || !bech32Address || !signingStargateClient) {
      return 0;
    }
    const rewards = await getBbnRewards();
    if (!rewards) {
      return 0;
    }

    const coins = rewards.rewardGauges[REWARD_GAUGE_KEY_BTC_DELEGATION]?.coins;
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
  }, [cosmosConnected, bech32Address, signingStargateClient, getBbnRewards]);

  /**
   * Estimates the gas fee for claiming rewards.
   * @returns {Promise<number>} The gas fee for claiming rewards.
   */
  const estimateClaimRewardsGas = useCallback(async (): Promise<number> => {
    if (!signingStargateClient || !bech32Address) {
      return 0;
    }

    const withdrawRewardMsg = createWithdrawRewardMsg(bech32Address);

    const gasFee = await estimateBbnGasFee(withdrawRewardMsg);
    return gasFee.amount.reduce((acc, coin) => acc + Number(coin.amount), 0);
  }, [signingStargateClient, bech32Address, estimateBbnGasFee]);

  /**
   * Claims the rewards from the user's account.
   */
  const claimRewards = useCallback(async () => {
    if (!signingStargateClient || !bech32Address) {
      return;
    }

    const msg = createWithdrawRewardMsg(bech32Address);

    await sendBbnTx(msg);
  }, [bech32Address, signingStargateClient, sendBbnTx]);

  return {
    getRewards,
    claimRewards,
    estimateClaimRewardsGas,
  };
};

const createWithdrawRewardMsg = (bech32Address: string) => {
  const withdrawRewardMsg = incentivetx.MsgWithdrawReward.fromPartial({
    type: "btc_delegation",
    address: bech32Address,
  });
  return {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgWithdrawReward,
    value: withdrawRewardMsg,
  };
};

import { incentivetx } from "@babylonlabs-io/babylon-proto-ts";
import { useCallback } from "react";

import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { BBN_REGISTRY_TYPE_URLS } from "@/utils/wallet/bbnRegistry";

import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";
import { useBbnQuery } from "../client/rpc/queries/useBbnQuery";

export const useRewardsService = () => {
  const { bech32Address } = useCosmosWallet();

  const { rewardsQuery } = useBbnQuery();
  const { estimateBbnGasFee, sendBbnTx } = useBbnTransaction();

  /**
   * Estimates the gas fee for claiming rewards.
   * @returns {Promise<number>} The gas fee for claiming rewards.
   */
  const estimateClaimRewardsGas = useCallback(async (): Promise<number> => {
    const withdrawRewardMsg = createWithdrawRewardMsg(bech32Address);

    const gasFee = await estimateBbnGasFee(withdrawRewardMsg);
    return gasFee.amount.reduce((acc, coin) => acc + Number(coin.amount), 0);
  }, [bech32Address, estimateBbnGasFee]);

  /**
   * Claims the rewards from the user's account.
   */
  const claimRewards = useCallback(async () => {
    const msg = createWithdrawRewardMsg(bech32Address);

    await sendBbnTx(msg);
    rewardsQuery.refetch();
  }, [bech32Address, sendBbnTx, rewardsQuery]);

  return {
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

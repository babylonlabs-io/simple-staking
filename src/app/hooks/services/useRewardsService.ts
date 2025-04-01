import { incentivetx } from "@babylonlabs-io/babylon-proto-ts";
import { useCallback } from "react";

import { useRewardsState } from "@/app/state/RewardState";
import { BBN_REGISTRY_TYPE_URLS } from "@/utils/wallet/bbnRegistry";

import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";
import { useBbnQuery } from "../client/rpc/queries/useBbnQuery";

export const useRewardsService = () => {
  const {
    bbnAddress,
    openRewardModal,
    closeRewardModal,
    refetchRewardBalance,
    setProcessing,
    setTransactionFee,
  } = useRewardsState();
  const { balanceQuery } = useBbnQuery();

  const { estimateBbnGasFee, sendBbnTx, signBbnTx } = useBbnTransaction();

  /**
   * Estimates the gas fee for claiming rewards.
   * @returns {Promise<number>} The gas fee for claiming rewards.
   */
  const estimateClaimRewardsGas = useCallback(async (): Promise<number> => {
    const withdrawRewardMsg = createWithdrawRewardMsg(bbnAddress);

    const gasFee = await estimateBbnGasFee(withdrawRewardMsg);
    return gasFee.amount.reduce((acc, coin) => acc + Number(coin.amount), 0);
  }, [bbnAddress, estimateBbnGasFee]);

  const showPreview = useCallback(async () => {
    setTransactionFee(0);
    setProcessing(true);
    openRewardModal();
    const fee = await estimateClaimRewardsGas();
    setTransactionFee(fee);
    setProcessing(false);
  }, [
    estimateClaimRewardsGas,
    setProcessing,
    openRewardModal,
    setTransactionFee,
  ]);

  /**
   * Claims the rewards from the user's account.
   */
  const claimRewards = useCallback(async () => {
    closeRewardModal();
    setProcessing(true);

    try {
      const msg = createWithdrawRewardMsg(bbnAddress);
      const signedTx = await signBbnTx(msg);
      await sendBbnTx(signedTx);

      await refetchRewardBalance();

      const initialBalance = balanceQuery.data || 0;
      let attempts = 0;
      const maxAttempts = 10;
      const pollInterval = 2e3;

      const pollBalance = async () => {
        if (attempts >= maxAttempts) {
          return;
        }

        attempts++;
        await balanceQuery.refetch();

        if (balanceQuery.data !== initialBalance) {
          return;
        }

        setTimeout(pollBalance, pollInterval);
      };

      await pollBalance();
    } catch (error) {
      console.error("Error claiming rewards:", error);
    } finally {
      setProcessing(false);
    }
  }, [
    bbnAddress,
    signBbnTx,
    sendBbnTx,
    refetchRewardBalance,
    balanceQuery,
    setProcessing,
    closeRewardModal,
  ]);

  return {
    claimRewards,
    showPreview,
  };
};

const createWithdrawRewardMsg = (bech32Address: string) => {
  const withdrawRewardMsg = incentivetx.MsgWithdrawReward.fromPartial({
    type: "btc_staker",
    address: bech32Address,
  });

  return {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgWithdrawReward,
    value: withdrawRewardMsg,
  };
};

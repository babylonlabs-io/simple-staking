import { incentivetx } from "@babylonlabs-io/babylon-proto-ts";
import { useCallback } from "react";

import { ONE_SECOND } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorProvider";
import { useRewardsState } from "@/app/state/RewardState";
import { retry } from "@/utils";
import { BBN_REGISTRY_TYPE_URLS } from "@/utils/wallet/bbnRegistry";

import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";
import { useBbnQuery } from "../client/rpc/queries/useBbnQuery";

const MAX_RETRY_ATTEMPTS = 3;

export const useRewardsService = () => {
  const {
    bbnAddress,
    openRewardModal,
    closeRewardModal,
    openProcessingModal,
    closeProcessingModal,
    setTransactionHash,
    refetchRewardBalance,
    setProcessing,
    setTransactionFee,
  } = useRewardsState();
  const { balanceQuery } = useBbnQuery();
  const { handleError } = useError();
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
    openProcessingModal();

    try {
      const msg = createWithdrawRewardMsg(bbnAddress);
      const signedTx = await signBbnTx(msg);
      const result = await sendBbnTx(signedTx);

      if (result?.txHash) {
        setTransactionHash(result.txHash);
      }

      await refetchRewardBalance();
      const initialBalance = balanceQuery.data || 0;
      await retry(
        () => balanceQuery.refetch().then((res) => res.data),
        (value) => value !== initialBalance,
        ONE_SECOND,
        MAX_RETRY_ATTEMPTS,
      );
    } catch (error: Error | any) {
      closeProcessingModal();
      setTransactionHash("");
      handleError({
        error,
      });
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
    setTransactionHash,
    handleError,
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

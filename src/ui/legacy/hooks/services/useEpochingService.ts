import { epochingtx } from "@babylonlabs-io/babylon-proto-ts";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import { useCallback } from "react";

import { useError } from "@/ui/legacy/context/Error/ErrorProvider";
import { useLogger } from "@/ui/legacy/hooks/useLogger";
import { BBN_REGISTRY_TYPE_URLS } from "@/ui/legacy/utils/wallet/bbnRegistry";

import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";

export const useEpochingService = () => {
  const { handleError } = useError();
  const logger = useLogger();
  const { estimateBbnGasFee, sendBbnTx, signBbnTx } = useBbnTransaction();

  /**
   * Estimates the gas fee for BABY staking.
   * @param delegatorAddress - The delegator address
   * @param validatorAddress - The validator address
   * @param amount - The amount to stake
   * @returns The gas fee for staking
   */
  const estimateStakeGas = useCallback(
    async (
      delegatorAddress: string,
      validatorAddress: string,
      amount: Coin,
    ): Promise<number> => {
      const stakeMsg = createStakeMsg(
        delegatorAddress,
        validatorAddress,
        amount,
      );
      const gasFee = await estimateBbnGasFee(stakeMsg);
      return gasFee.amount.reduce((acc, coin) => acc + Number(coin.amount), 0);
    },
    [estimateBbnGasFee],
  );

  /**
   * Estimates the gas fee for unstaking.
   * @param delegatorAddress - The delegator address
   * @param validatorAddress - The validator address
   * @param amount - The amount to unstake
   * @returns The gas fee for unstaking
   */
  const estimateUnstakeGas = useCallback(
    async (
      delegatorAddress: string,
      validatorAddress: string,
      amount: Coin,
    ): Promise<number> => {
      const unstakeMsg = createUnstakeMsg(
        delegatorAddress,
        validatorAddress,
        amount,
      );
      const gasFee = await estimateBbnGasFee(unstakeMsg);
      return gasFee.amount.reduce((acc, coin) => acc + Number(coin.amount), 0);
    },
    [estimateBbnGasFee],
  );

  /**
   * Estimates the gas fee for claiming rewards.
   * @param delegatorAddress - The delegator address
   * @param validatorAddress - The validator address
   * @returns The gas fee for claiming rewards
   */
  const estimateClaimRewardsGas = useCallback(
    async (
      delegatorAddress: string,
      validatorAddress: string,
    ): Promise<number> => {
      const claimMsg = createClaimRewardsMsg(
        delegatorAddress,
        validatorAddress,
      );
      const gasFee = await estimateBbnGasFee(claimMsg);
      return gasFee.amount.reduce((acc, coin) => acc + Number(coin.amount), 0);
    },
    [estimateBbnGasFee],
  );

  /**
   * Stakes tokens with a validator.
   * @param delegatorAddress - The delegator address
   * @param validatorAddress - The validator address
   * @param amount - The amount to stake
   * @returns The transaction result
   */
  const stake = useCallback(
    async (
      delegatorAddress: string,
      validatorAddress: string,
      amount: Coin,
    ) => {
      try {
        const msg = createStakeMsg(delegatorAddress, validatorAddress, amount);
        const signedTx = await signBbnTx(msg);
        const result = await sendBbnTx(signedTx);

        logger.info("Stake transaction completed", {
          txHash: result?.txHash,
        });

        return result;
      } catch (error: any) {
        logger.error(error);
        handleError({ error });
        throw error;
      }
    },
    [signBbnTx, sendBbnTx, logger, handleError],
  );

  /**
   * Unstakes tokens from a validator.
   * @param delegatorAddress - The delegator address
   * @param validatorAddress - The validator address
   * @param amount - The amount to unstake
   * @returns The transaction result
   */
  const unstake = useCallback(
    async (
      delegatorAddress: string,
      validatorAddress: string,
      amount: Coin,
    ) => {
      try {
        const msg = createUnstakeMsg(
          delegatorAddress,
          validatorAddress,
          amount,
        );
        const signedTx = await signBbnTx(msg);
        const result = await sendBbnTx(signedTx);

        logger.info("Unstake transaction completed", {
          txHash: result?.txHash,
        });

        return result;
      } catch (error: any) {
        logger.error(error);
        handleError({ error });
        throw error;
      }
    },
    [signBbnTx, sendBbnTx, logger, handleError],
  );

  /**
   * Claims rewards from a validator.
   * @param delegatorAddress - The delegator address
   * @param validatorAddress - The validator address
   * @returns The transaction result
   */
  const claimRewards = useCallback(
    async (delegatorAddress: string, validatorAddress: string) => {
      try {
        const msg = createClaimRewardsMsg(delegatorAddress, validatorAddress);
        const signedTx = await signBbnTx(msg);
        const result = await sendBbnTx(signedTx);

        logger.info("Claim rewards transaction completed", {
          txHash: result?.txHash,
        });

        return result;
      } catch (error: any) {
        logger.error(error);
        handleError({ error });
        throw error;
      }
    },
    [signBbnTx, sendBbnTx, logger, handleError],
  );

  return {
    stake,
    unstake,
    claimRewards,
    estimateStakeGas,
    estimateUnstakeGas,
    estimateClaimRewardsGas,
  };
};

/**
 * Creates a wrapped delegate message for staking.
 * @param delegatorAddress - The delegator address
 * @param validatorAddress - The validator address
 * @param amount - The amount to stake
 * @returns The wrapped delegate message
 */
const createStakeMsg = (
  delegatorAddress: string,
  validatorAddress: string,
  amount: Coin,
) => {
  const wrappedDelegateMsg = epochingtx.MsgWrappedDelegate.fromPartial({
    msg: {
      delegatorAddress,
      validatorAddress,
      amount,
    },
  });

  return {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgWrappedDelegate,
    value: wrappedDelegateMsg,
  };
};

/**
 * Creates a wrapped undelegate message for unstaking.
 * @param delegatorAddress - The delegator address
 * @param validatorAddress - The validator address
 * @param amount - The amount to unstake
 * @returns The wrapped undelegate message
 */
const createUnstakeMsg = (
  delegatorAddress: string,
  validatorAddress: string,
  amount: Coin,
) => {
  const wrappedUndelegateMsg = epochingtx.MsgWrappedUndelegate.fromPartial({
    msg: {
      delegatorAddress,
      validatorAddress,
      amount,
    },
  });

  return {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgWrappedUndelegate,
    value: wrappedUndelegateMsg,
  };
};

/**
 * Creates a withdraw delegator reward message for claiming rewards.
 * @param delegatorAddress - The delegator address
 * @param validatorAddress - The validator address
 * @returns The withdraw delegator reward message
 */
const createClaimRewardsMsg = (
  delegatorAddress: string,
  validatorAddress: string,
) => {
  const withdrawRewardMsg = MsgWithdrawDelegatorReward.fromPartial({
    delegatorAddress,
    validatorAddress,
  });

  return {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgWithdrawDelegatorReward,
    value: withdrawRewardMsg,
  };
};

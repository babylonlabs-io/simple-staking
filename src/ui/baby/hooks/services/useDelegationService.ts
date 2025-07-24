import { useCallback } from "react";

import babylon from "@/infrastructure/babylon";
import { useDelegations } from "@/ui/baby/hooks/api/useDelegations";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";
import { useLogger } from "@/ui/common/hooks/useLogger";

interface StakingParams {
  validatorAddress: string;
  amount: string;
}

export function useDelegationService() {
  const { bech32Address } = useCosmosWallet();
  const { data: delegations = [], refetch: refetchDelegations } =
    useDelegations(bech32Address);
  const { signBbnTx, sendBbnTx, estimateBbnGasFee } = useBbnTransaction();
  const { handleError } = useError();
  const logger = useLogger();

  const stake = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      try {
        if (!bech32Address) throw Error("Babylon Wallet is not connected");

        const stakeMsg = babylon.txs.baby.createStakeMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
          amount: babylon.utils.babyToUbbn(Number(amount)),
        });
        const signedTx = await signBbnTx(stakeMsg);
        const result = await sendBbnTx(signedTx);

        logger.info("Baby Staking: stake", {
          txHash: result?.txHash,
        });
        await refetchDelegations();
      } catch (error: any) {
        handleError({ error });
        logger.error(error);
      }
    },
    [
      bech32Address,
      signBbnTx,
      sendBbnTx,
      handleError,
      refetchDelegations,
      logger,
    ],
  );

  const unstake = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      try {
        if (!bech32Address) throw Error("Babylon Wallet is not connected");

        const unstakeMsg = babylon.txs.baby.createUnstakeMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
          amount: babylon.utils.babyToUbbn(Number(amount)),
        });
        const signedTx = await signBbnTx(unstakeMsg);
        const result = await sendBbnTx(signedTx);

        logger.info("Baby Staking: unstake", {
          txHash: result?.txHash,
        });
        await refetchDelegations();
      } catch (error: any) {
        handleError({ error });
        logger.error(error);
      }
    },
    [
      bech32Address,
      signBbnTx,
      sendBbnTx,
      handleError,
      refetchDelegations,
      logger,
    ],
  );

  const estimateStakingFee = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      try {
        if (!bech32Address) throw Error("Babylon Wallet is not connected");

        const stakeMsg = babylon.txs.baby.createStakeMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
          amount: babylon.utils.babyToUbbn(Number(amount)),
        });
        const result = await estimateBbnGasFee(stakeMsg);

        return result.amount.reduce(
          (sum, { amount }) => sum + Number(amount),
          0,
        );
      } catch (error: any) {
        handleError({ error });
        logger.error(error);
        return 0;
      }
    },
    [bech32Address, estimateBbnGasFee, handleError, logger],
  );

  return {
    delegations,
    stake,
    unstake,
    estimateStakingFee,
  };
}

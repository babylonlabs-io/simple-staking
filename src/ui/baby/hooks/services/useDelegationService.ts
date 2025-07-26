import { useCallback } from "react";

import babylon from "@/infrastructure/babylon";
import { useDelegations } from "@/ui/baby/hooks/api/useDelegations";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";

interface StakingParams {
  validatorAddress: string;
  amount: string;
}

export function useDelegationService() {
  const { bech32Address } = useCosmosWallet();
  const {
    data: delegations = [],
    refetch: refetchDelegations,
    isLoading,
  } = useDelegations(bech32Address);
  const { signBbnTx, sendBbnTx, estimateBbnGasFee } = useBbnTransaction();

  const stake = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      const stakeMsg = babylon.txs.baby.createStakeMsg({
        validatorAddress,
        delegatorAddress: bech32Address,
        amount: babylon.utils.babyToUbbn(Number(amount)),
      });
      const signedTx = await signBbnTx(stakeMsg);
      const result = await sendBbnTx(signedTx);

      await refetchDelegations();
      return result;
    },
    [bech32Address, signBbnTx, sendBbnTx, refetchDelegations],
  );

  const unstake = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      const unstakeMsg = babylon.txs.baby.createUnstakeMsg({
        validatorAddress,
        delegatorAddress: bech32Address,
        amount: babylon.utils.babyToUbbn(Number(amount)),
      });
      const signedTx = await signBbnTx(unstakeMsg);
      const result = await sendBbnTx(signedTx);

      await refetchDelegations();
      return result;
    },
    [bech32Address, signBbnTx, sendBbnTx, refetchDelegations],
  );

  const estimateStakingFee = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      const stakeMsg = babylon.txs.baby.createStakeMsg({
        validatorAddress,
        delegatorAddress: bech32Address,
        amount: babylon.utils.babyToUbbn(Number(amount)),
      });
      const result = await estimateBbnGasFee(stakeMsg);

      return result.amount.reduce((sum, { amount }) => sum + Number(amount), 0);
    },
    [bech32Address, estimateBbnGasFee],
  );

  return {
    loading: isLoading,
    delegations,
    stake,
    unstake,
    estimateStakingFee,
  };
}

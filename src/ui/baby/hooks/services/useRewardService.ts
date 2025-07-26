import { useCallback } from "react";

import babylon from "@/infrastructure/babylon";
import { useRewards } from "@/ui/baby/hooks/api/useRewards";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";

export function useRewardService() {
  const { bech32Address } = useCosmosWallet();
  const {
    data: rewards = [],
    isLoading,
    refetch: refetchRewards,
  } = useRewards(bech32Address);
  const { signBbnTx, sendBbnTx } = useBbnTransaction();

  const claimReward = useCallback(
    async (validatorAddress: string) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      const claimRewardMsg = babylon.txs.baby.createClaimRewardMsg({
        validatorAddress,
        delegatorAddress: bech32Address,
      });
      const signedTx = await signBbnTx(claimRewardMsg);
      const result = await sendBbnTx(signedTx);

      await refetchRewards();
      return result;
    },
    [bech32Address, signBbnTx, sendBbnTx, refetchRewards],
  );

  return {
    loading: isLoading,
    rewards,
    claimReward,
  };
}

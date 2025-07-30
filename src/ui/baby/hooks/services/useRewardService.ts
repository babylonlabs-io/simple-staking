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

  const claimAllRewards = useCallback(async () => {
    if (!bech32Address) throw Error("Babylon Wallet is not connected");
    const msgs = rewards.map((reward) =>
      babylon.txs.baby.createClaimRewardMsg({
        validatorAddress: reward.validatorAddress,
        delegatorAddress: bech32Address,
      }),
    );

    const signedTx = await signBbnTx(msgs);
    const result = await sendBbnTx(signedTx);

    await refetchRewards();
    return result;
  }, [bech32Address, rewards, signBbnTx, sendBbnTx, refetchRewards]);

  return {
    loading: isLoading,
    rewards,
    claimAllRewards,
  };
}

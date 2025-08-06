import { useCallback, useMemo } from "react";

import babylon from "@/infrastructure/babylon";
import { useRewards } from "@/ui/baby/hooks/api/useRewards";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";

export interface Reward {
  validatorAddress: string;
  coin: string;
  amount: bigint;
}

export function useRewardService() {
  const { bech32Address } = useCosmosWallet();
  const {
    data: rewards = [],
    isLoading,
    refetch: refetchRewards,
  } = useRewards(bech32Address);
  const { signBbnTx, sendBbnTx } = useBbnTransaction();

  console.log("🐛 BABY Rewards Debug:", {
    bech32Address,
    rewards,
    isLoading,
    rewardsLength: rewards.length,
  });

  const rewardList = useMemo(() => {
    const processed = rewards
      .map(({ validatorAddress, reward }) => {
        console.log(
          "🔍 Processing reward for validator:",
          validatorAddress,
          "rewards:",
          reward,
        );
        const coin = reward.find((coin) => coin.denom === "ubbn");
        console.log("💰 Found uBBN coin:", coin);
        return coin
          ? {
              validatorAddress,
              amount: BigInt(coin.amount),
              coin: coin.denom,
            }
          : null;
      })
      .filter(Boolean) as Reward[];

    console.log("📊 Final processed reward list:", processed);
    return processed;
  }, [rewards]);

  const totalReward = useMemo(() => {
    const total = rewardList.reduce(
      (total, reward) => total + reward.amount,
      0n,
    );
    console.log("💎 Total reward calculated:", total.toString(), "uBBN");
    return total;
  }, [rewardList]);

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
    rewards: rewardList,
    totalReward,
    claimAllRewards,
    refetchRewards,
  };
}

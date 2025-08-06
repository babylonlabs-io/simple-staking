import { useCallback, useMemo } from "react";

import babylon from "@/infrastructure/babylon";
import { useRewards } from "@/ui/baby/hooks/api/useRewards";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";
import { useEventEmitter } from "@/ui/common/hooks/useEventBus";
import { EVENTS } from "@/ui/common/utils/eventBus";

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
  const { emit } = useEventEmitter();

  const rewardList = useMemo(
    () =>
      rewards
        .map(({ validatorAddress, reward }) => {
          const coin = reward.find((coin) => coin.denom === "ubbn");
          return coin
            ? {
                validatorAddress,
                amount: BigInt(coin.amount),
                coin: coin.denom,
              }
            : null;
        })
        .filter(Boolean) as Reward[],
    [rewards],
  );

  const totalReward = useMemo(
    () => rewardList.reduce((total, reward) => total + reward.amount, 0n),
    [rewardList],
  );

  const claimAllRewards = useCallback(async () => {
    if (!bech32Address) throw Error("Babylon Wallet is not connected");

    try {
      emit(EVENTS.TX_START, { type: "claim" });

      const msgs = rewards.map((reward) =>
        babylon.txs.baby.createClaimRewardMsg({
          validatorAddress: reward.validatorAddress,
          delegatorAddress: bech32Address,
        }),
      );
      const signedTx = await signBbnTx(msgs);
      const result = await sendBbnTx(signedTx);

      emit(EVENTS.TX_SUCCESS, { type: "claim", txHash: result?.txHash });
      emit(EVENTS.REWARDS_REFRESH);

      await refetchRewards();
      return result;
    } catch (error) {
      emit(EVENTS.TX_FAIL, { type: "claim", error: error as Error });
      throw error;
    }
  }, [bech32Address, rewards, signBbnTx, sendBbnTx, refetchRewards, emit]);

  const claimReward = useCallback(
    async (validatorAddress: string) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      try {
        emit(EVENTS.TX_START, { type: "claim" });

        const msg = babylon.txs.baby.createClaimRewardMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
        });
        const signedTx = await signBbnTx(msg);
        const result = await sendBbnTx(signedTx);

        emit(EVENTS.TX_SUCCESS, { type: "claim", txHash: result?.txHash });
        emit(EVENTS.REWARDS_REFRESH);

        await refetchRewards();
        return result;
      } catch (error) {
        emit(EVENTS.TX_FAIL, { type: "claim", error: error as Error });
        throw error;
      }
    },
    [bech32Address, signBbnTx, sendBbnTx, refetchRewards, emit],
  );

  return {
    loading: isLoading,
    rewards: rewardList,
    totalReward,
    claimAllRewards,
    claimReward,
  };
}

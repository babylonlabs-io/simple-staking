import { type PropsWithChildren, useCallback, useMemo, useState } from "react";

import { useRewardService } from "@/ui/baby/hooks/services/useRewardService";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

interface Reward {
  validatorAddress: string;
  coin: string;
  amount: bigint;
}

interface RewardState {
  loading: boolean;
  rewards: Reward[];
  claim: (validatorAddress: string) => Promise<void>;
}

const { StateProvider, useState: useRewardState } =
  createStateUtils<RewardState>({
    loading: false,
    rewards: [],
    claim: async () => {},
  });

// TODO: group rewards
function RewardState({ children }: PropsWithChildren) {
  const [processing, setProcessing] = useState(false);

  const { loading, rewards, claimReward } = useRewardService();
  const { handleError } = useError();
  const logger = useLogger();

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

  const claim = useCallback(
    async (validatorAddress: string) => {
      try {
        setProcessing(true);
        const result = await claimReward(validatorAddress);
        logger.info("Baby Staking: stake", {
          txHash: result?.txHash,
        });
      } catch (error: any) {
        handleError({ error });
        logger.error(error);
      } finally {
        setProcessing(false);
      }
    },
    [logger, handleError, claimReward],
  );

  const context = useMemo(
    () => ({
      loading: loading || processing,
      rewards: rewardList,
      claim,
    }),
    [loading, processing, rewardList, claim],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { RewardState, useRewardState };

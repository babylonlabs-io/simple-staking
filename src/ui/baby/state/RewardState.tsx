import { type PropsWithChildren, useCallback, useMemo, useState } from "react";

import {
  type Reward,
  useRewardService,
} from "@/ui/baby/hooks/services/useRewardService";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

interface RewardState {
  loading: boolean;
  rewards: Reward[];
  claimAll: () => Promise<void>;
}

const { StateProvider, useState: useRewardState } =
  createStateUtils<RewardState>({
    loading: false,
    rewards: [],
    claimAll: async () => {},
  });

function RewardState({ children }: PropsWithChildren) {
  const [processing, setProcessing] = useState(false);

  const { loading, rewards, totalReward, claimAllRewards } = useRewardService();
  const { handleError } = useError();
  const logger = useLogger();

  const claimAll = useCallback(async () => {
    try {
      setProcessing(true);
      const result = await claimAllRewards();
      logger.info("Baby Staking: stake", {
        txHash: result?.txHash,
      });
    } catch (error: any) {
      handleError({ error });
      logger.error(error);
    } finally {
      setProcessing(false);
    }
  }, [logger, handleError, claimAllRewards]);

  const context = useMemo(
    () => ({
      loading: loading || processing,
      rewards,
      totalReward,
      claimAll,
    }),
    [loading, processing, rewards, totalReward, claimAll],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { RewardState, useRewardState };

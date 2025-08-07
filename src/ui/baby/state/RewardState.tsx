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
  totalReward: bigint;
  claimAll: () => Promise<void>;
  showClaimModal: boolean;
  openClaimModal: () => void;
  closeClaimModal: () => void;
  refreshRewards: () => void;
}

const { StateProvider, useState: useRewardState } =
  createStateUtils<RewardState>({
    loading: false,
    rewards: [],
    totalReward: 0n,
    claimAll: async () => {},
    showClaimModal: false,
    openClaimModal: () => {},
    closeClaimModal: () => {},
    refreshRewards: () => {},
  });

function RewardState({ children }: PropsWithChildren) {
  const [processing, setProcessing] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const { loading, rewards, totalReward, claimAllRewards, refetchRewards } =
    useRewardService();
  const { handleError } = useError();
  const logger = useLogger();

  const openClaimModal = useCallback(() => {
    setShowClaimModal(true);
  }, []);

  const closeClaimModal = useCallback(() => {
    setShowClaimModal(false);
  }, []);

  const refreshRewards = useCallback(() => {
    refetchRewards();
  }, [refetchRewards]);

  const claimAll = useCallback(async () => {
    try {
      setProcessing(true);
      const result = await claimAllRewards();
      logger.info("Baby Staking: claim rewards", {
        txHash: result?.txHash,
      });
      setShowClaimModal(false);
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
      showClaimModal,
      openClaimModal,
      closeClaimModal,
      refreshRewards,
    }),
    [
      loading,
      processing,
      rewards,
      totalReward,
      claimAll,
      showClaimModal,
      openClaimModal,
      closeClaimModal,
      refreshRewards,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { RewardState, useRewardState };

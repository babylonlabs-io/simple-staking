import { RewardCard } from "@/ui/baby/components/RewardCard";
import { RewardsPreviewModal } from "@/ui/baby/components/RewardPreviewModal";
import { useRewardState } from "@/ui/baby/state/RewardState";
import { RouteGuard } from "@/ui/common/components/RouteGuard/RouteGuard";

export default function Rewards() {
  const {
    showClaimModal,
    closeClaimModal,
    claimAll,
    loading,
    totalReward,
    rewards,
  } = useRewardState();

  return (
    <RouteGuard redirectTo="/baby/staking">
      <div className="h-[500px]">
        <RewardCard />
      </div>

      <RewardsPreviewModal
        open={showClaimModal}
        processing={loading}
        title="Claim Rewards"
        totalReward={totalReward}
        rewards={rewards}
        onClose={closeClaimModal}
        onProceed={claimAll}
      />
    </RouteGuard>
  );
}

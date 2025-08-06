import { RewardCard } from "@/ui/baby/components/RewardCard";
import { RewardsPreviewModal } from "@/ui/baby/components/RewardPreviewModal";
import { RouteGuard } from "@/ui/common/components/RouteGuard/RouteGuard";

export default function Rewards() {
  return (
    <RouteGuard redirectTo="/baby/staking">
      <div className="h-[500px]">
        <RewardCard />
      </div>

      <RewardsPreviewModal
        open
        title="Claim Rewards"
        onClose={() => {}}
        onProceed={() => {}}
      />
    </RouteGuard>
  );
}

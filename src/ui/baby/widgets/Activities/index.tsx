import { BabyActivityCard } from "@/ui/baby/components/ActivityCard";
import { UnbondingModal } from "@/ui/baby/components/UnbondingModal";
// import { useDelegationState } from "@/ui/baby/state/DelegationState";
import { RouteGuard } from "@/ui/common/components/RouteGuard/RouteGuard";

export default function Activities() {
  //const { delegations } = useDelegationState();

  return (
    <RouteGuard redirectTo="/baby/staking">
      <div className="h-[500px]">
        <BabyActivityCard />
      </div>

      <UnbondingModal open={false} onClose={() => {}} onSubmit={() => {}} />
    </RouteGuard>
  );
}

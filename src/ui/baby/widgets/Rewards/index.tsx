import { RouteGuard } from "@/ui/common/components/RouteGuard/RouteGuard";

export default function Rewards() {
  return (
    <RouteGuard redirectTo="/baby/staking">
      <div className="h-[500px]">Rewards</div>
    </RouteGuard>
  );
}

import { RouteGuard } from "@/ui/common/components/RouteGuard/RouteGuard";

export default function Activities() {
  return (
    <RouteGuard redirectTo="/baby/staking">
      <div className="h-[500px]">Activities</div>
    </RouteGuard>
  );
}

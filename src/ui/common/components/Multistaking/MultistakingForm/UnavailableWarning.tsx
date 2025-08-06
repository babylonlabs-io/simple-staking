import { Warning } from "@babylonlabs-io/core-ui";

import { useStakingExpansionAllowList } from "@/ui/common/hooks/useStakingExpansionAllowList";

export function UnavailableWarning() {
  const { isMultiStakingAllowListInForce } = useStakingExpansionAllowList();

  // If allow list is active, show warning about multi-staking being unavailable
  if (isMultiStakingAllowListInForce) {
    return (
      <Warning className="mt-2">
        New stakes can only delegate to Babylon Genesis. Multi-Staking is
        currently unavailable due to allow list restrictions.
      </Warning>
    );
  }

  // If allow list is not active, multi-staking should be available, so no warning
  return null;
}

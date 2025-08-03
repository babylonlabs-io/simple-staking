import { Warning } from "@babylonlabs-io/core-ui";

import { useAllowList } from "@/ui/common/hooks/useAllowList";

export function MultistakingUnavailableWarning() {
  const { isAllowListActive, allowList } = useAllowList();

  if (!allowList) {
    return null;
  }

  // If allow list is active, show warning about multi-staking being unavailable
  if (isAllowListActive) {
    return (
      <div className="mt-4">
        <Warning>
          New stakes can only delegate to Babylon Genesis. Multi-Staking is
          currently unavailable due to allow list restrictions.
        </Warning>
      </div>
    );
  }

  // If allow list is not active, multi-staking should be available, so no warning
  return null;
}

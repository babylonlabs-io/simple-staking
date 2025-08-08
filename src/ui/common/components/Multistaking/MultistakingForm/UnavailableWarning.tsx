import { Text, WarningIcon } from "@babylonlabs-io/core-ui";

import { STAKE_EXPANSION_MESSAGE } from "@/ui/common/constants";
import { useStakingExpansionAllowList } from "@/ui/common/hooks/useStakingExpansionAllowList";

export function UnavailableWarning() {
  const { isMultiStakingAllowListInForce } = useStakingExpansionAllowList();

  // If allow list is active, show warning about multi-staking being unavailable
  if (isMultiStakingAllowListInForce) {
    return (
      <div className="flex items-center text-sm gap-2">
        <WarningIcon variant="accent-primary" size={14} />
        <Text variant="body2" className="text-accent-primary">
          {STAKE_EXPANSION_MESSAGE}
        </Text>
      </div>
    );
  }

  // If allow list is not active, multi-staking should be available, so no warning
  return null;
}

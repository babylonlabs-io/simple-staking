import { useMemo } from "react";

import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/common/types/delegationsV2";

/**
 * Hook for detecting expansion conflicts between delegations.
 * Checks if a VERIFIED expansion has conflicting expansions that are already broadcasted.
 * Returns a validation map for all provided delegations.
 */
export function useExpansionConflictValidation(
  delegations: (DelegationV2 & { _isFromAPI?: boolean })[],
) {
  const validationMap = useMemo(() => {
    const map: Record<string, { valid: boolean; error?: string }> = {};

    delegations.forEach((delegation) => {
      // Only check expansion conflicts for VERIFIED expansions
      if (
        delegation.state === DelegationV2StakingState.VERIFIED &&
        delegation.previousStakingTxHashHex
      ) {
        // Check if another expansion for the same original staking has been broadcasted
        const hasConflictingExpansion = delegations.some(
          (other) =>
            other.previousStakingTxHashHex ===
              delegation.previousStakingTxHashHex &&
            other.stakingTxHashHex !== delegation.stakingTxHashHex && // Different expansion
            (other.state ===
              DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION ||
              other.state === DelegationV2StakingState.ACTIVE), // Already broadcasted
        );

        if (hasConflictingExpansion) {
          map[delegation.stakingTxHashHex] = {
            valid: false,
            error:
              "This expansion is no longer valid as another expansion for the same stake has been broadcasted",
          };
        } else {
          map[delegation.stakingTxHashHex] = { valid: true };
        }
      } else {
        // Not an expansion or not VERIFIED, no conflict check needed
        map[delegation.stakingTxHashHex] = { valid: true };
      }
    });

    return map;
  }, [delegations]);

  return validationMap;
}

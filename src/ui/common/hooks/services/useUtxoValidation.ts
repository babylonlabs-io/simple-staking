import { useMemo } from "react";

import { useAppState } from "@/ui/common/state";
import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/common/types/delegationsV2";
import { validateDelegation } from "@/ui/common/utils/delegations";

/**
 * Hook for validating delegation transactions against available UTXOs.
 * Returns a validation map for all provided delegations.
 */
export function useUtxoValidation(
  delegations: (DelegationV2 & { _isFromAPI?: boolean })[],
) {
  const { availableUTXOs = [] } = useAppState();

  const validationMap = useMemo(() => {
    const map: Record<string, { valid: boolean; error?: string }> = {};

    delegations.forEach((delegation) => {
      // Skip UTXO validation for broadcasted expansion transactions
      // They're already confirmed on-chain, so UTXO checks don't make sense
      if (
        delegation._isFromAPI &&
        delegation.previousStakingTxHashHex &&
        delegation.state === DelegationV2StakingState.VERIFIED
      ) {
        map[delegation.stakingTxHashHex] = { valid: true };
        return;
      }

      // First check basic UTXO validation
      const basicValidation = validateDelegation(delegation, availableUTXOs);

      // For verified expansions, also check if the previous staking transaction
      // is still available for expansion (no other expansion has been broadcasted)
      if (
        basicValidation.valid &&
        delegation.state === DelegationV2StakingState.VERIFIED &&
        delegation.previousStakingTxHashHex
      ) {
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
          return;
        }
      }

      map[delegation.stakingTxHashHex] = basicValidation;
    });

    return map;
  }, [delegations, availableUTXOs]);

  return validationMap;
}

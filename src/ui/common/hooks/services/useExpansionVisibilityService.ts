import { useCallback } from "react";

import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/common/types/delegationsV2";
import { isExpansionBroadcasted } from "@/ui/common/utils/local_storage/expansionStorage";

/**
 * Hook providing expansion visibility services.
 * Centralizes logic for determining which delegations should be visible
 * in different UI parts (Activity tab vs Verified Expansion Modal).
 */
export function useExpansionVisibilityService(
  publicKeyNoCoord: string | undefined,
) {
  /**
   * Checks if a delegation is a broadcasted expansion.
   * A broadcasted expansion must meet both criteria:
   * 1. Has VERIFIED status in the API data (delegation.state)
   * 2. Has INTERMEDIATE_PENDING_BTC_CONFIRMATION status in localStorage (user broadcasted it)
   */
  const isBroadcastedExpansion = useCallback(
    (delegation: DelegationV2): boolean => {
      // First, verify this is actually VERIFIED in the API data
      if (delegation.state !== DelegationV2StakingState.VERIFIED) {
        return false;
      }

      // Check if this is an expansion (has previousStakingTxHashHex)
      if (!delegation.previousStakingTxHashHex) {
        return false;
      }

      // Then check directly in localStorage if it's been broadcasted
      return isExpansionBroadcasted(
        delegation.stakingTxHashHex,
        publicKeyNoCoord,
      );
    },
    [publicKeyNoCoord],
  );

  /**
   * Checks if an original staking transaction should be hidden.
   * Original staking transactions are hidden when they have broadcasted expansions.
   */
  const isOriginalTransactionHidden = useCallback(
    (stakeHashHex: string, delegations: DelegationV2[]): boolean => {
      // Find any expansion that references this original transaction
      const relatedExpansions = delegations.filter(
        (delegation) =>
          delegation.previousStakingTxHashHex === stakeHashHex &&
          isBroadcastedExpansion(delegation),
      );

      return relatedExpansions.length > 0;
    },
    [isBroadcastedExpansion],
  );

  /**
   * Returns delegations that should be visible in the Activity tab.
   * Applies the following rules:
   * 1. Exclude VERIFIED expansions that are not broadcasted (show in modal only)
   * 2. Include VERIFIED expansions that are broadcasted (INTERMEDIATE_PENDING_BTC_CONFIRMATION)
   * 3. Exclude original transactions that have broadcasted expansions
   * 4. Include all other regular transactions
   */
  const getActivityTabDelegations = useCallback(
    (delegations: DelegationV2[]): DelegationV2[] => {
      // Performance optimization: Pre-compute hidden transaction IDs to avoid O^2 complexity
      const hiddenOriginalTxIds = new Set<string>();

      // First pass: identify all original transactions that should be hidden
      delegations.forEach((delegation) => {
        if (
          delegation.previousStakingTxHashHex &&
          isBroadcastedExpansion(delegation)
        ) {
          hiddenOriginalTxIds.add(
            delegation.previousStakingTxHashHex.toLowerCase(),
          );
        }
      });

      // Second pass: filter delegations using O(1) Set lookups
      return delegations.filter((delegation) => {
        // Always exclude EXPANDED state delegations (existing logic)
        if (delegation.state === DelegationV2StakingState.EXPANDED) {
          return false;
        }

        // Handle VERIFIED expansions
        if (
          delegation.state === DelegationV2StakingState.VERIFIED &&
          delegation.previousStakingTxHashHex
        ) {
          // Only include if it's been broadcasted by the user
          return isBroadcastedExpansion(delegation);
        }

        // Check if this is an original transaction that should be hidden (O(1) lookup)
        if (
          hiddenOriginalTxIds.has(delegation.stakingTxHashHex.toLowerCase())
        ) {
          return false;
        }

        // Include all other transactions
        return true;
      });
    },
    [isBroadcastedExpansion],
  );

  /**
   * Returns delegations that should be visible in the Verified Expansion Modal.
   * These are VERIFIED expansions with previousStakingTxHashHex that haven't been broadcasted yet.
   */
  const getVerifiedExpansionModalDelegations = useCallback(
    (delegations: DelegationV2[]): DelegationV2[] => {
      return delegations.filter(
        (delegation) =>
          delegation.state === DelegationV2StakingState.VERIFIED &&
          delegation.previousStakingTxHashHex &&
          !isBroadcastedExpansion(delegation),
      );
    },
    [isBroadcastedExpansion],
  );

  return {
    getActivityTabDelegations,
    getVerifiedExpansionModalDelegations,
    isOriginalTransactionHidden,
    isBroadcastedExpansion,
  };
}

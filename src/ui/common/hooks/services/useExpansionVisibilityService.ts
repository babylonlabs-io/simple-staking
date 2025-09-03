import { useCallback } from "react";

import { useDelegationStorage } from "@/ui/common/hooks/storage/useDelegationStorage";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/common/types/delegationsV2";
import { getExpansionsLocalStorageKey } from "@/ui/common/utils/local_storage/getExpansionsLocalStorageKey";

/**
 * Hook providing expansion visibility services.
 * Centralizes complex logic for determining which delegations should be visible
 * in different UI parts (Activity tab vs Verified Expansion Modal).
 */
export function useExpansionVisibilityService(
  publicKeyNoCoord: string | undefined,
) {
  const { expansions } = useStakingExpansionState();

  // Access expansion localStorage for broadcast status detection
  const expansionStorageKey = publicKeyNoCoord
    ? getExpansionsLocalStorageKey(publicKeyNoCoord)
    : "";

  // Get pending delegations from localStorage to check broadcast status
  const { delegations: expansionStorageDelegations } = useDelegationStorage(
    expansionStorageKey,
    expansions,
  );

  /**
   * Checks if a delegation is a broadcasted expansion.
   * A broadcasted expansion has INTERMEDIATE_PENDING_VERIFICATION status in localStorage
   * and is VERIFIED in the API data.
   */
  const isBroadcastedExpansion = useCallback(
    (delegation: DelegationV2): boolean => {
      // Check if this delegation exists in localStorage with INTERMEDIATE_PENDING_VERIFICATION status
      const storedDelegation = expansionStorageDelegations.find(
        (stored) => stored.stakingTxHashHex === delegation.stakingTxHashHex,
      );

      return (
        storedDelegation?.state ===
        DelegationV2StakingState.INTERMEDIATE_PENDING_VERIFICATION
      );
    },
    [expansionStorageDelegations],
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
   * 2. Include VERIFIED expansions that are broadcasted (INTERMEDIATE_PENDING_VERIFICATION)
   * 3. Exclude original transactions that have broadcasted expansions
   * 4. Include all other regular transactions
   */
  const getActivityTabDelegations = useCallback(
    (delegations: DelegationV2[]): DelegationV2[] => {
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

        // Check if this is an original transaction that should be hidden
        if (
          isOriginalTransactionHidden(delegation.stakingTxHashHex, delegations)
        ) {
          return false;
        }

        // Include all other transactions
        return true;
      });
    },
    [isBroadcastedExpansion, isOriginalTransactionHidden],
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

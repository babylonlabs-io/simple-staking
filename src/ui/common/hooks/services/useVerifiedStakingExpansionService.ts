import { useCallback, useMemo } from "react";

import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import { StakingExpansionStep } from "@/ui/common/state/StakingExpansionTypes";
import {
  DelegationV2,
  DelegationV2StakingState,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";

// import { useStakingExpansionService } from "./useStakingExpansionService";

/**
 * Hook providing verified staking expansion services.
 * Manages verified expansions that are waiting for BTC signing and broadcast.
 */
export function useVerifiedStakingExpansionService() {
  const {
    expansions,
    setVerifiedDelegation,
    goToStep,
    setVerifiedExpansionModalOpen,
    selectedDelegationForVerifiedModal,
    setSelectedDelegationForVerifiedModal,
  } = useStakingExpansionState();
  // const { stakeDelegationExpansion } = useStakingExpansionService();

  /**
   * Get all verified staking expansions.
   * These are delegations that:
   * 1. Have state='VERIFIED'
   * 2. Have a previousStakingTxHashHex (indicating they are expansions)
   * 3. If a specific delegation is selected, filter to show only expansions for that delegation
   */
  const verifiedExpansions = useMemo(() => {
    // First, get all verified expansions
    const allVerified = expansions.filter(
      (expansion) =>
        expansion.state === DelegationV2StakingState.VERIFIED &&
        expansion.previousStakingTxHashHex,
    );

    // Filter out verified expansions if another expansion for the same original transaction
    // has already been broadcasted (mutual exclusivity)
    const availableVerified = allVerified.filter((expansion) => {
      // Check if any other expansion for the same original transaction is already being processed
      const hasProcessingExpansion = expansions.some(
        (other) =>
          other.previousStakingTxHashHex ===
            expansion.previousStakingTxHashHex &&
          other.stakingTxHashHex !== expansion.stakingTxHashHex && // Different expansion
          (other.state ===
            DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION ||
            other.state === DelegationV2StakingState.ACTIVE), // Already processed
      );

      return !hasProcessingExpansion;
    });

    // If a specific delegation is selected for the modal, filter to only show expansions for that delegation
    if (selectedDelegationForVerifiedModal) {
      const filtered = availableVerified.filter(
        (expansion) =>
          expansion.previousStakingTxHashHex ===
          selectedDelegationForVerifiedModal.stakingTxHashHex,
      );
      return filtered;
    }

    // Otherwise, return all available verified expansions
    return availableVerified;
  }, [expansions, selectedDelegationForVerifiedModal]);

  /**
   * Open the verified expansion modal.
   */
  const openVerifiedExpansionModal = useCallback(() => {
    setVerifiedExpansionModalOpen(true);
  }, [setVerifiedExpansionModalOpen]);

  /**
   * Open the verified expansion modal for a specific delegation.
   */
  const openVerifiedExpansionModalForDelegation = useCallback(
    (delegation: DelegationWithFP) => {
      setSelectedDelegationForVerifiedModal(delegation);
      setVerifiedExpansionModalOpen(true);
    },
    [setSelectedDelegationForVerifiedModal, setVerifiedExpansionModalOpen],
  );

  /**
   * Close the verified expansion modal and clear the filter.
   */
  const closeVerifiedExpansionModal = useCallback(() => {
    setSelectedDelegationForVerifiedModal(null);
    setVerifiedExpansionModalOpen(false);
  }, [setVerifiedExpansionModalOpen, setSelectedDelegationForVerifiedModal]);

  /**
   * Close the verified expansion modal without clearing the filter.
   * Used during expand transition to prevent flash.
   */
  const closeVerifiedExpansionModalOnly = useCallback(() => {
    setVerifiedExpansionModalOpen(false);
  }, [setVerifiedExpansionModalOpen]);

  /**
   * Resume a verified expansion.
   * This follows the same pattern as regular staking - one delegation at a time.
   * Closes the list modal and opens individual expansion modal.
   */
  const resumeVerifiedExpansion = useCallback(
    async (delegation: DelegationV2) => {
      // Close the verified expansions modal without clearing filter (prevents flash)
      closeVerifiedExpansionModalOnly();

      // Set the verified delegation (same as regular staking pattern)
      setVerifiedDelegation(delegation);

      // Go to the verified step to show individual StakeModal
      goToStep(StakingExpansionStep.VERIFIED);

      // The user will then click "Stake" in the individual StakeModal,
      // which will call stakeDelegationExpansion for this single delegation
    },
    [closeVerifiedExpansionModalOnly, setVerifiedDelegation, goToStep],
  );

  /**
   * Get verified expansions for a specific original delegation.
   * This is useful when showing verified expansions related to a specific stake.
   */
  const getVerifiedExpansionsForDelegation = useCallback(
    (originalStakingTxHashHex: string) => {
      return verifiedExpansions.filter(
        (expansion) =>
          expansion.previousStakingTxHashHex === originalStakingTxHashHex,
      );
    },
    [verifiedExpansions],
  );

  /**
   * Get delegation-specific verified expansion info.
   * Returns count and boolean for a specific delegation.
   */
  const getVerifiedExpansionInfoForDelegation = useCallback(
    (originalStakingTxHashHex: string) => {
      const delegationExpansions = getVerifiedExpansionsForDelegation(
        originalStakingTxHashHex,
      );
      return {
        count: delegationExpansions.length,
        hasVerifiedExpansions: delegationExpansions.length > 0,
        expansions: delegationExpansions,
      };
    },
    [getVerifiedExpansionsForDelegation],
  );

  return {
    verifiedExpansions,
    openVerifiedExpansionModal,
    openVerifiedExpansionModalForDelegation,
    closeVerifiedExpansionModal,
    closeVerifiedExpansionModalOnly,
    resumeVerifiedExpansion,
    getVerifiedExpansionsForDelegation,
    getVerifiedExpansionInfoForDelegation,
  };
}

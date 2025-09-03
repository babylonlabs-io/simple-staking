import { useCallback, useMemo } from "react";

import { useDelegationValidation } from "@/ui/common/hooks/services/useDelegationValidation";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import { StakingExpansionStep } from "@/ui/common/state/StakingExpansionTypes";
import {
  DelegationV2,
  DelegationV2StakingState,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";

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

  /**
   * Get all verified staking expansions.
   * These are delegations that:
   * 1. Have state='VERIFIED'
   * 2. Have a previousStakingTxHashHex (indicating they are expansions)
   */
  const verifiedExpansions = useMemo(() => {
    // Get all verified expansions
    return expansions.filter(
      (expansion) =>
        expansion.state === DelegationV2StakingState.VERIFIED &&
        expansion.previousStakingTxHashHex,
    );
  }, [expansions]);

  // Validate all verified expansions (UTXO validation + expansion conflicts)
  const validationMap = useDelegationValidation(verifiedExpansions);

  // Filter verified expansions to only include those with valid UTXOs
  const validVerifiedExpansions = useMemo(() => {
    // Filter out expansions with invalid UTXOs
    return verifiedExpansions.filter(
      (expansion) => validationMap[expansion.stakingTxHashHex]?.valid !== false,
    );
  }, [verifiedExpansions, validationMap]);

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
   * This already returns only valid expansions (with available UTXOs).
   */
  const getVerifiedExpansionsForDelegation = useCallback(
    (originalStakingTxHashHex: string) => {
      return validVerifiedExpansions.filter(
        (expansion) =>
          expansion.previousStakingTxHashHex === originalStakingTxHashHex,
      );
    },
    [validVerifiedExpansions],
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
    verifiedExpansions: validVerifiedExpansions,
    selectedDelegationForVerifiedModal,
    openVerifiedExpansionModal,
    openVerifiedExpansionModalForDelegation,
    closeVerifiedExpansionModal,
    closeVerifiedExpansionModalOnly,
    resumeVerifiedExpansion,
    getVerifiedExpansionsForDelegation,
    getVerifiedExpansionInfoForDelegation,
  };
}

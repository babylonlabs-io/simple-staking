import type { StakingExpansionFormData } from "@/ui/common/state/StakingExpansionTypes";
import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/common/types/delegationsV2";
import { isExpansionBroadcasted } from "@/ui/common/utils/local_storage/expansionStorage";

/**
 * Validation helper for StakingExpansionFormData
 */
export const validateExpansionFormData = (
  data: Partial<StakingExpansionFormData>,
): data is StakingExpansionFormData => {
  // For renewal-only mode, selectedBsnFps can be empty
  const hasValidBsnFps = data.isRenewalOnly
    ? data.selectedBsnFps !== undefined
    : data.selectedBsnFps && Object.keys(data.selectedBsnFps).length > 0;

  return !!(
    data.originalDelegation &&
    hasValidBsnFps &&
    data.feeRate &&
    data.feeRate > 0 &&
    data.stakingTimelock &&
    data.stakingTimelock > 0
  );
};

/**
 * Validates whether a VERIFIED delegation should be included in Activity
 * even when it doesn't have valid UTXOs yet (expansion case).
 *
 * @param delegation - The delegation to validate
 * @param publicKeyNoCoord - The user's public key for localStorage access
 * @returns true if this is a valid broadcasted expansion that should be shown
 */
export const isValidBroadcastedExpansion = (
  delegation: DelegationV2,
  publicKeyNoCoord: string | undefined,
): boolean => {
  // Early return false if delegation is NOT in VERIFIED state
  // or does NOT have a previous staking tx (not an expansion)
  if (
    delegation.state !== DelegationV2StakingState.VERIFIED ||
    !delegation.previousStakingTxHashHex
  ) {
    return false;
  }

  // Check if it's a broadcasted expansion in localStorage
  return isExpansionBroadcasted(delegation.stakingTxHashHex, publicKeyNoCoord);
};

import type { StakingExpansionFormData } from "@/ui/common/state/StakingExpansionTypes";

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

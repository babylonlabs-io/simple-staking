import type { StakingExpansionFormData } from "@/ui/common/state/StakingExpansionTypes";

/**
 * Validation helper for StakingExpansionFormData
 */
export const validateExpansionFormData = (
  data: Partial<StakingExpansionFormData>,
): data is StakingExpansionFormData => {
  return !!(
    data.originalDelegation &&
    data.selectedBsnFps &&
    Object.keys(data.selectedBsnFps).length > 0 &&
    data.feeRate &&
    data.feeRate > 0 &&
    data.stakingTimelock &&
    data.stakingTimelock > 0
  );
};

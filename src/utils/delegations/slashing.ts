import { BbnStakingParamsVersion } from "@/app/types/networkInfo";

/**
 * Calculates the slashing amount based on the staking amount and the slashing
 * rate.
 * @param stakingAmount - The amount of staking.
 * @param param - The staking param.
 * @returns The slashing amount.
 */
export const getSlashingAmount = (
  stakingAmount: number,
  param: BbnStakingParamsVersion,
) => {
  if (!param.slashing) {
    // Slashing param not found
    return 0;
  }

  // Round the slashing rate to two decimal places
  const slashingRate = parseFloat(param.slashing.slashingRate.toFixed(2));

  return Math.floor(stakingAmount * slashingRate);
};

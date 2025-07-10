import { Decimal } from "decimal.js-light";

import { BbnStakingParamsVersion } from "@/ui/common/types/networkInfo";

import { maxDecimals } from "../maxDecimals";

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
  const slashingRate = maxDecimals(
    param.slashing.slashingRate,
    2,
    Decimal.ROUND_UP,
  );

  return Math.floor(stakingAmount * slashingRate);
};

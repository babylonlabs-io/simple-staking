import { StakingParams } from "@babylonlabs-io/btc-staking-ts";

export const getStakingTerm = (params: StakingParams, term: number) => {
  // check if term is fixed
  let termWithFixed;
  if (params && params.minStakingTimeBlocks === params.maxStakingTimeBlocks) {
    // if term is fixed, use the API value
    termWithFixed = params.minStakingTimeBlocks;
  } else {
    // if term is not fixed, use the term from the input
    termWithFixed = term;
  }
  return termWithFixed;
};

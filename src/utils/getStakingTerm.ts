import { GlobalParamsVersion } from "@/app/types/globalParams";

export const getStakingTerm = (params: GlobalParamsVersion, term: number) => {
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

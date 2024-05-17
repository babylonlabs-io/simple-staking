import { GlobalParamsVersion } from "@/app/api/getGlobalParams";

export const getStakingTerm = (params: GlobalParamsVersion, term: number) => {
  // check if term is fixed
  let termWithFixed;
  if (params && params.minStakingTime === params.maxStakingTime) {
    // if term is fixed, use the API value
    termWithFixed = params.minStakingTime;
  } else {
    // if term is not fixed, use the term from the input
    termWithFixed = term;
  }
  return termWithFixed;
};

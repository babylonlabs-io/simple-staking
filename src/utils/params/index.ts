import { BbnStakingParamsVersion } from "@/app/types/networkInfo";

/*
  Get the BBN param by BTC height
  @param height - The BTC height
  @param bbnParams - The BBN params
  @returns The BBN param
*/
export const getBbnParamByBtcHeight = (
  height: number,
  bbnParams: BbnStakingParamsVersion[],
) => {
  // Sort by btcActivationHeight in ascending order
  const sortedParams = [...bbnParams].sort(
    (a, b) => b.btcActivationHeight - a.btcActivationHeight,
  );

  // Find first param where height is >= btcActivationHeight
  const param = sortedParams.find(
    (param) => height >= param.btcActivationHeight,
  );
  // system error
  if (!param) throw new Error(`BBN param not found for height ${height}`);
  return param;
};

/*
  Get the BBN param by version
  @param version - The BBN param version
  @param bbnParams - The BBN params
  @returns The BBN param
*/
export const getBbnParamByVersion = (
  version: number,
  bbnParams: BbnStakingParamsVersion[],
): BbnStakingParamsVersion => {
  const param = bbnParams.find((param) => param.version === version);
  if (!param) throw new Error(`BBN param not found for version ${version}`);
  return param;
};

import { BbnStakingParamsVersion } from "@/app/types/networkInfo";

export const getBbnParamByBtcHeight = (
  height: number,
  bbnParams: BbnStakingParamsVersion[],
) => {
  // Sort by btcActivationHeight in ascending order
  const sortedParams = [...bbnParams].sort(
    (a, b) => a.btcActivationHeight - b.btcActivationHeight,
  );

  // Find first param where height is >= btcActivationHeight
  return sortedParams.find((param) => height >= param.btcActivationHeight);
};

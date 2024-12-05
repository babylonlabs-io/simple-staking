import { useMemo } from "react";

import { BbnStakingParamsVersion } from "../types/networkInfo";

import { useNetworkInfo } from "./client/api/useNetworkInfo";

export function useParamByHeight(height: number) {
  const { data: networkInfo } = useNetworkInfo();
  return useMemo(
    () =>
      getBbnParamByBtcHeight(
        height,
        networkInfo?.params.bbnStakingParams.versions ?? [],
      ),
    [networkInfo, height],
  );
}

const getBbnParamByBtcHeight = (
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

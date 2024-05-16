import {
  GlobalParamsVersion,
  getGlobalParams,
} from "@/app/api/getGlobalParams";


export const getGlobalParamsVersioByHeight = async (
  height: number,
): Promise<GlobalParamsVersion> => {
  if (!height) {
    throw new Error("Height is not provided");
  }

  const versions = await getGlobalParams();

  // sorted in descending order
  const sorted = versions.sort(
    (a, b) => b.activationHeight - a.activationHeight,
  );

  // find the first version that is less than or equal to the current height + 1 (next block height)
  const params = sorted.find(
    (v) => v.activationHeight <= height,
  );

  if (!params) {
    throw new Error("No global params version found");
  }
  return params;
};

// This method returns the global params version that would be active at the next block height (current height + 1)
// return null if no version is found.
// This means that the current height is less than the activation height of the first version
// i.e staking has not started yet
export const getCurrentGlobalParamsVersion = async (
  getCurrentBtcHeight: () => Promise<number>,
): Promise<GlobalParamsVersion | null> => {
  const [height, versions] = await Promise.all([getCurrentBtcHeight(), getGlobalParams()])

  // sorted in descending order
  const sorted = versions.sort(
    (a, b) => b.activationHeight - a.activationHeight,
  );

  // find the first version that is less than or equal to the current height + 1 (next block height)
  const param = sorted.find(
    (v) => v.activationHeight <= height + 1,
  );

  if (!param) {
    return null;
  }
  return param;
};

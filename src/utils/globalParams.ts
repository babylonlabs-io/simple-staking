import {
  GlobalParamsVersion,
  getGlobalParams,
} from "@/app/api/getGlobalParams";
import { version } from "os";


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

export interface GlobalParamsWithContext {
  currentVersion?: GlobalParamsVersion;
  isApprochingNextVersion: boolean;
}

// This function returns the current global params version and whether the next version is approaching
// The current version is the one that is active at the current height + 1
// Return undefined if no version is found, which means the current height is lower than the first version
export const getCurrentGlobalParamsVersion = async (
  getCurrentBtcHeight: () => Promise<number>,
): Promise<GlobalParamsWithContext> => {
  const [height, versions] = await Promise.all([getCurrentBtcHeight(), getGlobalParams()])

  // sorted in descending order
  const sorted = versions.sort(
    (a, b) => b.activationHeight - a.activationHeight,
  );

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    if (curr.activationHeight <= height + 1) {
      if (
        sorted[i - 1] &&
        sorted[i - 1].activationHeight <= height + 1 + curr.confirmationDepth
      ) {
        return {
          currentVersion: curr,
          isApprochingNextVersion: true,
        };
      }
      return {
        currentVersion: curr,
        isApprochingNextVersion: false,
      };
    }
  }

  return {
    currentVersion: undefined,
    isApprochingNextVersion: false,
  };
};

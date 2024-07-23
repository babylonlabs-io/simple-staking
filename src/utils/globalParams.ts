import { GlobalParamsVersion } from "@/app/types/globalParams";

export interface ParamsWithContext {
  currentVersion: GlobalParamsVersion | undefined;
  nextVersion: GlobalParamsVersion | undefined;
  isApprochingNextVersion: boolean;
  firstActivationHeight: number;
}

// This function returns the current global params version and whether the next version is approaching
// The current version is the one that is active at the current height
// Return currentVersion being undefined if no version is found,
// which means the current height is lower than the first version
export const getCurrentGlobalParamsVersion = (
  height: number,
  versionedParams: GlobalParamsVersion[],
): ParamsWithContext => {
  if (!versionedParams.length) {
    throw new Error("No global params versions found");
  }
  // Step 1: Sort the versions in descending order based on activationHeight
  // Note, we have cloned the array to avoid mutating the original array
  const sorted = [...versionedParams].sort(
    (a, b) => b.activationHeight - a.activationHeight,
  );

  const firstActivationHeight = sorted[sorted.length - 1].activationHeight;

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    let isApprochingNextVersion = false;
    let nextVersion: GlobalParamsVersion | undefined;
    // Check if the current version is active at the given height
    if (curr.activationHeight <= height) {
      // Check if the next version is approaching
      if (sorted[i - 1]) {
        // Return the current version and whether the next version is approaching
        if (sorted[i - 1].activationHeight <= height + curr.confirmationDepth) {
          isApprochingNextVersion = true;
        }
        nextVersion = sorted[i - 1];
      }
      // Return the current version if the next version is not approaching
      return {
        currentVersion: curr,
        nextVersion,
        isApprochingNextVersion,
        firstActivationHeight,
      };
    }
  }
  return {
    currentVersion: undefined,
    nextVersion: undefined,
    isApprochingNextVersion: false,
    firstActivationHeight,
  };
};

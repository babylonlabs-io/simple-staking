import { GlobalParamsVersion } from "@/app/types/globalParams";

// This function returns the current global params version and whether the next version is approaching
// The current version is the one that is active at the current height
// Return currentVersion being undefined if no version is found,
// which means the current height is lower than the first version
export const getCurrentGlobalParamsVersion = (
  height: number,
  versionedParams: GlobalParamsVersion[],
) => {
  // Step 1: Sort the versions in descending order based on activationHeight
  const sorted = versionedParams.sort(
    (a, b) => b.activationHeight - a.activationHeight,
  );

  const firstActivationHeight = sorted[sorted.length - 1].activationHeight;

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    let isApprochingNextVersion = false;
    // Check if the current version is active at the given height
    if (curr.activationHeight <= height) {
      // Check if the next version is approaching
      if (
        sorted[i - 1] &&
        sorted[i - 1].activationHeight <= height + curr.confirmationDepth
      ) {
        // Return the current version and whether the next version is approaching
        isApprochingNextVersion = true;
      }
      // Return the current version if the next version is not approaching
      return {
        currentVersion: curr,
        isApprochingNextVersion,
        firstActivationHeight,
      };
    }
    return {
      currentVersion: undefined,
      isApprochingNextVersion,
      firstActivationHeight,
    };
  }
  throw new Error("No global params version found");
};

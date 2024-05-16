import {
  GlobalParamsVersion,
  getGlobalParams,
} from "@/app/api/getGlobalParams";

export interface GlobalParamsData {

}

// Height is the current block height of the blockchain (latest block height)
// or the height at which you want to get the global params version (staking height)
export const getCurrentGlobalParamsVersion = async (
  height: number,
): Promise<GlobalParamsVersion> => {
  // throw new Error("No current version found");
  if (!height) {
    throw new Error("Height is not provided");
  }

  const versions = await getGlobalParams();

  // sorted in descending order
  const sorted = versions.sort(
    (a, b) => b.activationHeight - a.activationHeight,
  );

  // if activation height is greater than current btc height, return the version
  const currentVersion = sorted.find(
    (v) => v.activationHeight <= height,
  );

  if (!currentVersion) {
    throw new Error("No current version found");
  } else {
    return currentVersion;
  }
};

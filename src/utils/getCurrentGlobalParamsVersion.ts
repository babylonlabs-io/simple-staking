import {
  GlobalParamsVersion,
  getGlobalParams,
} from "@/app/api/getGlobalParams";

// Height is the current block height of the blockchain (latest block height)
// or the height at which you want to get the global params version (staking height)
export const getCurrentGlobalParamsVersion = async (
  height: number,
): Promise<GlobalParamsVersion> => {
  if (!height) {
    throw new Error("Height is not provided");
  }

  const globalParamsData = await getGlobalParams();

  const sorted = [...globalParamsData.data.versions].sort(
    (a, b) => b.activation_height - a.activation_height,
  );

  // if activation height is greater than current btc height, return the version
  const currentVersion = sorted.find(
    (version) => version.activation_height <= height,
  );

  if (!currentVersion) {
    throw new Error("No current version found");
  } else {
    return currentVersion;
  }
};

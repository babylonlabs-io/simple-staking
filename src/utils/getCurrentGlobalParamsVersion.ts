import {
  GlobalParamsVersion,
  getGlobalParams,
} from "@/app/api/getGlobalParams";

export const getCurrentGlobalParamsVersion = async (
  getBTCTipHeight?: () => Promise<number>,
  // manual height is required for unbonding
  height?: number,
): Promise<GlobalParamsVersion> => {
  if (!getBTCTipHeight) {
    throw new Error("Wallet is not loaded");
  }
  const globalParamsData = await getGlobalParams();

  let currentBtcHeight;
  if (!height) {
    try {
      currentBtcHeight = await getBTCTipHeight();
    } catch (error: Error | any) {
      throw new Error("Couldn't get current BTC height");
    }
  } else {
    currentBtcHeight = height;
  }

  const sorted = [...globalParamsData.data.versions].sort(
    (a, b) => b.activation_height - a.activation_height,
  );

  // if activation height is greater than current btc height, return the version
  const currentVersion = sorted.find(
    (version) => version.activation_height <= currentBtcHeight,
  );
  if (!currentVersion) {
    throw new Error("No current version found");
  } else {
    return currentVersion;
  }
};

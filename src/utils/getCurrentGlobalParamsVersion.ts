import {
  GlobalParamsVersion,
  getGlobalParams,
} from "@/app/api/getGlobalParams";

import { WalletProvider } from "./wallet/wallet_provider";

export const getCurrentGlobalParamsVersion = async (
  btcWallet: WalletProvider | undefined,
  // manual height is required for unbonding
  height?: number,
): Promise<GlobalParamsVersion> => {
  if (!btcWallet) {
    throw new Error("Wallet is not loaded");
  }
  const globalParamsData = await getGlobalParams();

  let currentBtcHeight;
  if (!height) {
    try {
      currentBtcHeight = await btcWallet?.btcTipHeight();
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

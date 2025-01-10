import { Network } from "@/utils/wallet/btc_wallet_provider";

import { network } from "./network/btc";

// shouldDisplayTestingMsg function is used to check if the application is running in testing mode or not.
// Default to true if the environment variable is not set.
export const shouldDisplayTestingMsg = (): boolean => {
  return (
    process.env.NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES?.toString() !== "false"
  );
};

// getNetworkAppUrl function is used to get the network app url based on the environment
export const getNetworkAppUrl = (): string => {
  return shouldDisplayTestingMsg()
    ? "https://btcstaking.testnet.babylonchain.io"
    : "https://btcstaking.babylonlabs.io";
};

// getBtcNetwork function is used to get the BTC network based on the environment
export const getBtcNetwork = (): Network => {
  return network;
};

export const IS_FIXED_TERM_FIELD =
  process.env.NEXT_PUBLIC_FIXED_STAKING_TERM === "true";

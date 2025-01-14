import type { Network } from "@babylonlabs-io/bbn-wallet-connect";

import { network } from "./network/btc";

// Default gas price for BABY
const DEFAULT_BBN_GAS_PRICE = 0.002;

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

// BBN_GAS_PRICE is used to get the gas price for BABY
export const BBN_GAS_PRICE = (() => {
  const price = parseFloat(process.env.NEXT_PUBLIC_BBN_GAS_PRICE || "");
  if (isNaN(price) || price <= 0 || price >= 1) {
    return DEFAULT_BBN_GAS_PRICE; // fallback to default if invalid
  }
  return price;
})();

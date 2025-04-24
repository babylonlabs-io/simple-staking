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

export const DEFAULT_FILTER_VALUE: "active" | "inactive" =
  process.env.NEXT_PUBLIC_DEFAULT_FP_FILTER === "inactive"
    ? "inactive"
    : "active";

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

export const PROD_ENVS = ["mainnet", "phase-2-mainnet"];

export const isProductionEnv = (): boolean => {
  const env = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "";
  return PROD_ENVS.includes(env);
};

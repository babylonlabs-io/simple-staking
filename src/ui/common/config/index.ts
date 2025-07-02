// Default gas price for BABY
const DEFAULT_BBN_GAS_PRICE = 0.002;

// API URL configuration
export const getApiBaseUrl = (): string => {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL environment variable is not defined");
  }

  if (apiUrl === "/") {
    apiUrl = "";
  }

  return apiUrl;
};

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

// PROD_ENVS defines production environments from CI matrix in GitHub workflows
// These values match the environment names in the CI matrix configuration
export const PROD_ENVS = ["phase-2-mainnet"];

export const isProductionEnv = (): boolean => {
  const env = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "";
  return PROD_ENVS.includes(env);
};

// Disable the wallet by their name in the event of incident. split by comma.
// You can find the wallet name from the wallet provider.
export const getDisabledWallets = (): string[] => {
  return (
    process.env.NEXT_PUBLIC_DISABLED_WALLETS?.split(",").map((w) => w.trim()) ||
    []
  );
};

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

// shouldDisplayPoints function is used to check if the application should
// display points or not based on the existence of the environment variable.
export const shouldDisplayPoints = (): boolean => {
  return !!process.env.NEXT_PUBLIC_POINTS_API_URL;
};

// shouldDisableUnbonding function is used to check if the application should
// disable unbonding or not based on the existence of the environment variable.
export const shouldDisableUnbonding = (): boolean => {
  return process.env.NEXT_PUBLIC_DISABLE_UNBONDING?.toString() === "true";
};

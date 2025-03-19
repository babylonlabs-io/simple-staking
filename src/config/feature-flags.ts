// shouldDisplayTestingMsg function is used to check if the application is running in testing mode or not.
// Default to true if the environment variable is not set.
export const shouldDisplayTestingMsg = (): boolean => {
  return (
    process.env.NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES?.toString() !== "false"
  );
};

// shouldUseLegacyRewardsQuery function is used to check if the application
// should use the legacy rewards query when calling Babylon RPC.
// Default to true if the environment variable is not set.
export const shouldUseLegacyRewardsQuery = (): boolean => {
  return process.env.NEXT_PUBLIC_LEGACY_REWARDS_QUERY?.toString() !== "false";
};

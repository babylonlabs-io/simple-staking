/**
 * Feature flags service module
 *
 * This module provides methods for checking feature flags
 * defined in the environment variables. All feature flag environment
 * variables should be prefixed with FF_
 *
 * Rules:
 * 1. All feature flags must be defined in this file for easy maintenance
 * 2. All feature flags must start with FF_ prefix
 * 3. Default value for all feature flags is false
 * 4. Feature flags are only configurable by DevOps in mainnet environments
 */

export type FeatureFlag = "MULTISTAKING";

/**
 * Checks if a specific feature flag is enabled
 * @param flag The feature flag to check
 * @returns True if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const envKey = `FF_${flag}`;
  const flagValue = process.env[envKey]?.toLowerCase();

  // Default to false if not explicitly set to "true"
  return flagValue === "true";
}

/**
 * MULTISTAKING feature flag
 *
 * Purpose: Enables multi-staking functionality
 * Why needed: To gradually roll out multi-staking capabilities
 * ETA for removal: TBD - Will be removed once multi-staking is fully released
 */
export const isMultistakingEnabled = (): boolean =>
  isFeatureEnabled("MULTISTAKING");

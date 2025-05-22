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

class FeatureFlagService {
  /**
   * Gets the value of a feature flag from environment variables
   * @param flagName The feature flag name to check
   * @returns True if the feature is enabled, false otherwise
   */
  private static getFlagValue(flagName: string): boolean {
    const envKey = `FF_${flagName.toUpperCase()}`;
    const value = process.env[envKey]?.toLowerCase();
    return value === "true";
  }

  /**
   * MULTISTAKING feature flag
   *
   * Purpose: Enables multi-staking functionality
   * Why needed: To gradually roll out multi-staking capabilities
   * ETA for removal: TBD - Will be removed once multi-staking is fully released
   */
  static get IsMultiStakingEnabled(): boolean {
    return this.getFlagValue("MULTISTAKING");
  }
}

export default FeatureFlagService;

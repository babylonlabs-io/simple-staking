/**
 * Feature flags service module
 *
 * This module provides methods for checking feature flags
 * defined in the environment variables. All feature flag environment
 * variables should be prefixed with NEXT_PUBLIC_FF_
 *
 * Rules:
 * 1. All feature flags must be defined in this file for easy maintenance
 * 2. All feature flags must start with NEXT_PUBLIC_FF_ prefix
 * 3. Default value for all feature flags is false
 * 4. Feature flags are only configurable by DevOps in mainnet environments
 */

type FeatureFlag = "MULTISTAKING" | "ENABLE_LEDGER" | "PHASE_3";

class FeatureFlagService {
  /**
   * Gets the value of a feature flag from compile-time constants
   * @param flagName The feature flag name to check
   * @returns True if the feature is enabled, false otherwise
   */
  private static getFlagValue(flagName: FeatureFlag): boolean {
    // The set of feature flags are defined here so process.env will be
    // looked up at runtime.
    const featureFlags = {
      MULTISTAKING: process.env.NEXT_PUBLIC_FF_MULTISTAKING === "true",
      ENABLE_LEDGER: process.env.NEXT_PUBLIC_FF_ENABLE_LEDGER === "true",
      PHASE_3: process.env.NEXT_PUBLIC_FF_PHASE_3 === "true",
    } as const;

    const result = featureFlags[flagName];
    return result;
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

  /**
   * ENABLE_LEDGER feature flag
   *
   * Purpose: Enables ledger support
   * Why needed: To gradually roll out ledger support
   * ETA for removal: TBD - Will be removed once ledger support is fully released
   */
  static get IsLedgerEnabled(): boolean {
    return this.getFlagValue("ENABLE_LEDGER");
  }

  /**
   * PHASE_3 feature flag
   *
   * Purpose: Enables phase 3 functionality
   * Why needed: To gradually roll out phase 3
   * ETA for removal: TBD - Will be removed once phase 3 is fully released
   */
  static get IsPhase3Enabled(): boolean {
    return this.getFlagValue("PHASE_3");
  }
}

export default FeatureFlagService;

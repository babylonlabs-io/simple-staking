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

export default {
  /**
   * ENABLE_LEDGER feature flag
   *
   * Purpose: Enables ledger support
   * Why needed: To gradually roll out ledger support
   * ETA for removal: TBD - Will be removed once ledger support is fully released
   */
  get IsLedgerEnabled() {
    return process.env.NEXT_PUBLIC_FF_ENABLE_LEDGER === "true";
  },

  /**
   * PHASE_3 feature flag
   *
   * Purpose: Enables phase 3 functionality
   * Why needed: To gradually roll out phase 3
   * ETA for removal: TBD - Will be removed once phase 3 is fully released
   */
  get IsPhase3Enabled() {
    return process.env.NEXT_PUBLIC_FF_PHASE_3 === "true";
  },

  /**
   * Baby Staking feature flag
   *
   * Purpose: Enables Baby Staking Page
   * Why needed: To gradually roll out Baby Staking
   * ETA for removal: TBD - Will be removed once Baby Staking is fully released
   */
  get IsBabyStakingEnabled() {
    return process.env.NEXT_PUBLIC_FF_BABYSTAKING === "true";
  },
};

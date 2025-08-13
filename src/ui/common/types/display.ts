/**
 * Shared types for display components and modals
 */

/** Display item for BSN/FP pairs in preview modals */
export interface BsnFpDisplayItem {
  icon: React.ReactNode;
  name: string;
  isExisting?: boolean; // For expansion: mark existing BSN/FPs with reduced opacity
}

/** Staking term information */
export interface StakingTerm {
  blocks: string;
  duration: string;
}

/** Staking details for preview modals */
export interface StakingDetails {
  stakeAmount: string;
  feeRate: string;
  transactionFees: string;
  term: StakingTerm;
  unbonding: string;
  unbondingFee: string;
}

import type { EventData } from "@babylonlabs-io/btc-staking-ts";

import type {
  DelegationV2,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";

/**
 * Enum representing the different steps in the staking expansion workflow.
 */
export enum StakingExpansionStep {
  /** Initial step for selecting BSN and Finality Provider pairs */
  BSN_FP_SELECTION = "bsn-fp-selection",
  /** Preview step showing expansion details before signing */
  PREVIEW = "preview",
  /** EOI signing steps - these follow the same pattern as regular staking */
  EOI_STAKING_SLASHING = "eoi-staking-slashing",
  EOI_UNBONDING_SLASHING = "eoi-unbonding-slashing",
  EOI_PROOF_OF_POSSESSION = "eoi-proof-of-possession",
  EOI_SIGN_BBN = "eoi-sign-bbn",
  EOI_SEND_BBN = "eoi-send-bbn",
  /** Verification and completion steps */
  VERIFYING = "verifying",
  VERIFIED = "verified",
  /** Feedback steps for user experience */
  FEEDBACK_SUCCESS = "feedback-success",
  FEEDBACK_CANCEL = "feedback-cancel",
}

/**
 * Form data interface for staking expansion operations.
 * Contains all necessary information to execute an expansion transaction.
 */
export interface StakingExpansionFormData {
  /** The original delegation being expanded */
  originalDelegation: DelegationWithFP;
  /** Mapping of BSN ID to Finality Provider public key for new BSN+FP pairs */
  selectedBsnFps: Record<string, string>;
  /** Fee rate in sat/vB for the expansion transaction */
  feeRate: number;
  /** Calculated fee amount in satoshis */
  feeAmount: number;
  /** Staking timelock in blocks */
  stakingTimelock: number;
}

/**
 * Main state interface for staking expansion workflow management.
 * Handles the complete lifecycle from BSN selection to transaction completion.
 */
export interface StakingExpansionState {
  // Core state properties
  /** Indicates if there's an error in the expansion process */
  hasError: boolean;
  /** Indicates if an operation is currently in progress */
  processing: boolean;
  /** Human-readable error message for user display */
  errorMessage?: string;
  /** Current form data for the expansion */
  formData?: StakingExpansionFormData;
  /** Current step in the expansion workflow */
  step?: StakingExpansionStep;
  /** Verified delegation data after BBN verification */
  verifiedDelegation?: DelegationV2;
  /** Event data options for current step */
  expansionStepOptions: EventData | undefined;

  // Core actions
  /** Navigate to a specific step in the expansion flow */
  goToStep: (step: StakingExpansionStep, options?: EventData) => void;
  /** Set processing state */
  setProcessing: (value: boolean) => void;
  /** Update form data */
  setFormData: (formData?: StakingExpansionFormData) => void;
  /** Set verified delegation after BBN verification */
  setVerifiedDelegation: (value?: DelegationV2) => void;
  /** Reset all state to initial values */
  reset: () => void;
  /** Set options for current expansion step */
  setExpansionStepOptions: (options?: EventData) => void;

  // Network configuration
  /** Maximum number of finality providers allowed based on network parameters */
  maxFinalityProviders: number;

  // Helper methods for BSN management
  /** Get current count of BSNs in the original delegation */
  getCurrentBsnCount: () => number;
  /** Get number of available BSN slots based on network parameters */
  getAvailableBsnSlots: () => number;
  /** Check if more BSNs can be added */
  canAddMoreBsns: () => boolean;
}

/**
 * Validation helper for StakingExpansionFormData
 */
export const validateExpansionFormData = (
  data: Partial<StakingExpansionFormData>,
): data is StakingExpansionFormData => {
  return !!(
    data.originalDelegation &&
    data.selectedBsnFps &&
    Object.keys(data.selectedBsnFps).length > 0 &&
    data.feeRate &&
    data.feeRate > 0 &&
    data.stakingTimelock &&
    data.stakingTimelock > 0
  );
};

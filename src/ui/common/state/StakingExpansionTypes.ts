import type { EventData } from "@babylonlabs-io/btc-staking-ts";

import { BaseStakingStep, EOIStep } from "@/ui/common/constants";
import type {
  DelegationV2,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";

/**
 * Enum representing the different steps in the staking expansion workflow.
 * Extends shared EOI steps to avoid code duplication.
 */
export enum StakingExpansionStep {
  /** Initial step for selecting BSN and Finality Provider pairs - unique to expansion */
  BSN_FP_SELECTION = "bsn-fp-selection",
  /** Base workflow steps - reuse shared base steps */
  PREVIEW = BaseStakingStep.PREVIEW,
  /** EOI signing steps - reuse shared EOI steps */
  EOI_STAKING_SLASHING = EOIStep.EOI_STAKING_SLASHING,
  EOI_UNBONDING_SLASHING = EOIStep.EOI_UNBONDING_SLASHING,
  EOI_PROOF_OF_POSSESSION = EOIStep.EOI_PROOF_OF_POSSESSION,
  EOI_SIGN_BBN = EOIStep.EOI_SIGN_BBN,
  EOI_SEND_BBN = EOIStep.EOI_SEND_BBN,
  /** Final steps */
  VERIFYING = BaseStakingStep.VERIFYING,
  VERIFIED = BaseStakingStep.VERIFIED,
  FEEDBACK_SUCCESS = BaseStakingStep.FEEDBACK_SUCCESS,
  FEEDBACK_CANCEL = BaseStakingStep.FEEDBACK_CANCEL,
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
  /** Get number of available BSN slots based on network parameters */
  getAvailableBsnSlots: () => number;
  /** Check if more BSNs can be added */
  canAddMoreBsns: () => boolean;
  /** Check if expansion is possible for a given delegation */
  canExpand: (delegation: { finalityProviderBtcPksHex: string[] }) => boolean;
}

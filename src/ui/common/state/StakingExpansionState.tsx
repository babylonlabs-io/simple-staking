import { EventData } from "@babylonlabs-io/btc-staking-ts";
import { useCallback, useState, type PropsWithChildren } from "react";

import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";
import type {
  DelegationV2,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";
import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";

// IMPROVE: Configuration constants extracted for better maintainability
const DEFAULT_BSN_COUNT_FALLBACK = 1 as const;
const DEFAULT_MAX_FINALITY_PROVIDERS = 1;

/**
 * Enum representing the different steps in the staking expansion workflow.
 * PROD: Consider adding analytics tracking for each step transition.
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
  /** Staking timelock in blocks (should match original delegation) */
  stakingTimelock: number;
}

/**
 * Validation helper for StakingExpansionFormData
 * ENHANCE: Add more comprehensive validation rules
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

const { StateProvider, useState: useStakingExpansionState } =
  createStateUtils<StakingExpansionState>({
    hasError: false,
    processing: false,
    errorMessage: undefined,
    formData: undefined,
    step: undefined,
    verifiedDelegation: undefined,
    goToStep: () => {},
    setProcessing: () => {},
    setFormData: () => {},
    setVerifiedDelegation: () => {},
    reset: () => {},
    expansionStepOptions: undefined,
    setExpansionStepOptions: () => {},
    maxFinalityProviders: DEFAULT_MAX_FINALITY_PROVIDERS,
    getCurrentBsnCount: () => 0,
    getAvailableBsnSlots: () => 0,
    canAddMoreBsns: () => false,
  });

/**
 * Provider component for staking expansion state management.
 * Wraps the application with expansion-specific state and methods.
 *
 * PROD: Consider adding error boundary handling around this provider.
 */
export function StakingExpansionState({ children }: PropsWithChildren) {
  const { data: networkInfo } = useNetworkInfo();

  // Calculate maxFinalityProviders using the same logic as MultistakingState
  const maxFinalityProviders =
    FeatureFlagService.IsPhase3Enabled &&
    networkInfo?.params.bbnStakingParams.latestParam.maxFinalityProviders
      ? networkInfo.params.bbnStakingParams.latestParam.maxFinalityProviders
      : DEFAULT_MAX_FINALITY_PROVIDERS;

  const [hasError, setHasError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [formData, setFormData] = useState<
    StakingExpansionFormData | undefined
  >();
  const [step, setStep] = useState<StakingExpansionStep | undefined>();
  const [verifiedDelegation, setVerifiedDelegation] = useState<
    DelegationV2 | undefined
  >();
  const [expansionStepOptions, setExpansionStepOptions] = useState<
    EventData | undefined
  >();

  const goToStep = useCallback(
    (step: StakingExpansionStep, options?: EventData) => {
      setStep(step);
      if (options) {
        setExpansionStepOptions(options);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setHasError(false);
    setProcessing(false);
    setErrorMessage(undefined);
    setFormData(undefined);
    setStep(undefined);
    setVerifiedDelegation(undefined);
    setExpansionStepOptions(undefined);
  }, []);

  /**
   * Calculate current BSN count from the original delegation.
   * ENHANCE: Consider caching this calculation if it becomes expensive.
   */
  const getCurrentBsnCount = useCallback(() => {
    if (!formData?.originalDelegation) return 0;
    const fpCount =
      formData.originalDelegation.finalityProviderBtcPksHex?.length || 0;
    // IMPROVE: Use consistent logic - if no FPs exist, assume at least 1 BSN for backward compatibility
    // This handles cases where existing delegations might not have this data populated correctly
    return fpCount > 0 ? fpCount : DEFAULT_BSN_COUNT_FALLBACK;
  }, [formData]);

  /**
   * Calculate available BSN slots based on network parameter maxFinalityProviders and current count.
   */
  const getAvailableBsnSlots = useCallback(() => {
    const currentCount = getCurrentBsnCount();
    const availableSlots = maxFinalityProviders - currentCount;
    return Math.max(0, availableSlots); // Ensure we never return negative values
  }, [getCurrentBsnCount, maxFinalityProviders]);

  /**
   * Check if more BSNs can be added to the delegation.
   */
  const canAddMoreBsns = useCallback(() => {
    return getAvailableBsnSlots() > 0;
  }, [getAvailableBsnSlots]);

  const state: StakingExpansionState = {
    hasError,
    processing,
    errorMessage,
    formData,
    step,
    verifiedDelegation,
    goToStep,
    setProcessing,
    setFormData,
    setVerifiedDelegation,
    reset,
    expansionStepOptions,
    setExpansionStepOptions,
    maxFinalityProviders,
    getCurrentBsnCount,
    getAvailableBsnSlots,
    canAddMoreBsns,
  };

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useStakingExpansionState };

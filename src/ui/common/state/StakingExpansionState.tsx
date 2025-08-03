import { EventData } from "@babylonlabs-io/btc-staking-ts";
import { useCallback, useState, type PropsWithChildren } from "react";

import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";
import type { DelegationV2 } from "@/ui/common/types/delegationsV2";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";
import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";

import {
  StakingExpansionStep,
  type StakingExpansionFormData,
  type StakingExpansionState,
} from "./StakingExpansionTypes";

const DEFAULT_MAX_FINALITY_PROVIDERS = 1;

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
 */
export function StakingExpansionState({ children }: PropsWithChildren) {
  const { data: networkInfo } = useNetworkInfo();

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
   */
  const getCurrentBsnCount = useCallback(() => {
    if (!formData?.originalDelegation) return 0;
    const fpCount =
      formData.originalDelegation.finalityProviderBtcPksHex?.length || 0;
    return fpCount;
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

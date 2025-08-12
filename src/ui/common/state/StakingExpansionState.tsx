import { EventData, RegistrationStep } from "@babylonlabs-io/btc-staking-ts";
import {
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import { DEFAULT_MAX_FINALITY_PROVIDERS } from "@/ui/common/constants";
import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";
import { useEventBus } from "@/ui/common/hooks/useEventBus";
import type { DelegationV2 } from "@/ui/common/types/delegationsV2";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";
import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";

import {
  StakingExpansionStep,
  type StakingExpansionFormData,
  type StakingExpansionState,
} from "./StakingExpansionTypes";

const EXPANSION_STEP_MAP: Record<RegistrationStep, StakingExpansionStep> = {
  "staking-slashing": StakingExpansionStep.EOI_STAKING_SLASHING,
  "unbonding-slashing": StakingExpansionStep.EOI_UNBONDING_SLASHING,
  "proof-of-possession": StakingExpansionStep.EOI_PROOF_OF_POSSESSION,
  "create-btc-delegation-msg": StakingExpansionStep.EOI_SIGN_BBN,
};

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
    getAvailableBsnSlots: () => 0,
    canAddMoreBsns: () => false,
    canExpand: () => false,
  });

/**
 * Provider component for staking expansion state management.
 * Wraps the application with expansion-specific state and methods.
 */
export function StakingExpansionState({ children }: PropsWithChildren) {
  const { data: networkInfo } = useNetworkInfo();
  const eventBus = useEventBus();

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

  useEffect(() => {
    const unsubscribe = eventBus.on("delegation:expand", (options) => {
      const type = options?.type as RegistrationStep | undefined;

      if (type) {
        const stepName = EXPANSION_STEP_MAP[type];
        if (stepName) {
          setStep(stepName);
          setExpansionStepOptions(options);
        }
      }
    });

    return unsubscribe;
  }, [setStep, setExpansionStepOptions, eventBus]);

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
   * Calculate available BSN slots based on network parameter maxFinalityProviders and current count.
   */
  const getAvailableBsnSlots = useCallback(() => {
    const currentCount =
      formData?.originalDelegation?.finalityProviderBtcPksHex?.length || 0;
    const availableSlots = maxFinalityProviders - currentCount;
    return Math.max(0, availableSlots); // Ensure we never return negative values
  }, [formData, maxFinalityProviders]);

  /**
   * Check if more BSNs can be added to the delegation.
   */
  const canAddMoreBsns = useCallback(() => {
    return getAvailableBsnSlots() > 0;
  }, [getAvailableBsnSlots]);

  /**
   * Check if expansion is possible for a given delegation.
   * @param delegation - The delegation to check expansion for
   */
  const canExpand = useCallback(
    (delegation: { finalityProviderBtcPksHex: string[] }) => {
      const currentBsnCount = delegation.finalityProviderBtcPksHex.length;
      const availableSlots = maxFinalityProviders - currentBsnCount;
      return availableSlots > 0;
    },
    [maxFinalityProviders],
  );

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
    getAvailableBsnSlots,
    canAddMoreBsns,
    canExpand,
  };

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useStakingExpansionState };

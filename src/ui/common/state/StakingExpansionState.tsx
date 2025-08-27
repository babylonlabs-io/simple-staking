import { EventData, RegistrationStep } from "@babylonlabs-io/btc-staking-ts";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { DEFAULT_MAX_FINALITY_PROVIDERS } from "@/ui/common/constants";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useDelegationsV2 } from "@/ui/common/hooks/client/api/useDelegationsV2";
import { useDelegationStorage } from "@/ui/common/hooks/storage/useDelegationStorage";
import { useEventBus } from "@/ui/common/hooks/useEventBus";
import { useMaxFinalityProviders } from "@/ui/common/hooks/useMaxFinalityProviders";
import type {
  DelegationV2,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";
import { getExpansionsLocalStorageKey } from "@/ui/common/utils/local_storage/getExpansionsLocalStorageKey";

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
    expansionHistoryModalOpen: false,
    expansionHistoryTargetDelegation: null,
    setExpansionHistoryModalOpen: () => {},
    openExpansionHistoryModal: () => {},
    closeExpansionHistoryModal: () => {},
    isExpansionModalOpen: false,
    verifiedExpansionModalOpen: false,
    setVerifiedExpansionModalOpen: () => {},
    selectedDelegationForVerifiedModal: null,
    setSelectedDelegationForVerifiedModal: () => {},
    maxFinalityProviders: DEFAULT_MAX_FINALITY_PROVIDERS,
    getAvailableBsnSlots: () => 0,
    canAddMoreBsns: () => false,
    canExpand: () => false,
    expansions: [],
    addPendingExpansion: () => {},
    updateExpansionStatus: () => {},
    refetchExpansions: async () => {},
  });

/**
 * Provider component for staking expansion state management.
 * Wraps the application with expansion-specific state and methods.
 */
export function StakingExpansionState({ children }: PropsWithChildren) {
  const eventBus = useEventBus();
  const maxFinalityProviders = useMaxFinalityProviders();
  const { publicKeyNoCoord } = useBTCWallet();
  const { bech32Address } = useCosmosWallet();

  // Fetch delegations from API for expansion storage sync
  const { data, refetch } = useDelegationsV2(bech32Address);

  // Expansion-specific storage using the same pattern as regular delegations
  const {
    delegations: expansions,
    addPendingDelegation: addPendingExpansion,
    updateDelegationStatus: updateExpansionStatus,
  } = useDelegationStorage(
    getExpansionsLocalStorageKey(publicKeyNoCoord),
    data?.delegations,
  );

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
  const [expansionHistoryModalOpen, setExpansionHistoryModalOpen] =
    useState(false);
  const [
    expansionHistoryTargetDelegation,
    setExpansionHistoryTargetDelegation,
  ] = useState<DelegationWithFP | null>(null);
  const [verifiedExpansionModalOpen, setVerifiedExpansionModalOpen] =
    useState(false);
  const [
    selectedDelegationForVerifiedModal,
    setSelectedDelegationForVerifiedModal,
  ] = useState<DelegationWithFP | null>(null);

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
    setExpansionHistoryModalOpen(false);
    setExpansionHistoryTargetDelegation(null);
    setVerifiedExpansionModalOpen(false);
    setSelectedDelegationForVerifiedModal(null);
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

  // Modal control functions
  const openExpansionHistoryModal = useCallback(
    (delegation: DelegationWithFP) => {
      setExpansionHistoryTargetDelegation(delegation);
      setExpansionHistoryModalOpen(true);
    },
    [],
  );

  const closeExpansionHistoryModal = useCallback(() => {
    setExpansionHistoryModalOpen(false);
    setExpansionHistoryTargetDelegation(null);
  }, []);

  // Computed state: true when any expansion-related modal is open
  const isExpansionModalOpen =
    Boolean(step) || expansionHistoryModalOpen || verifiedExpansionModalOpen;

  const refetchExpansions = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const state: StakingExpansionState = useMemo(
    () => ({
      // State values
      hasError,
      processing,
      errorMessage,
      formData,
      step,
      verifiedDelegation,
      expansionStepOptions,
      expansionHistoryModalOpen,
      expansionHistoryTargetDelegation,
      verifiedExpansionModalOpen,
      selectedDelegationForVerifiedModal,
      isExpansionModalOpen,
      expansions,
      maxFinalityProviders,
      // Stable functions (created with useCallback)
      goToStep,
      setProcessing,
      setFormData,
      setVerifiedDelegation,
      reset,
      setExpansionStepOptions,
      setExpansionHistoryModalOpen,
      openExpansionHistoryModal,
      closeExpansionHistoryModal,
      setVerifiedExpansionModalOpen,
      setSelectedDelegationForVerifiedModal,
      getAvailableBsnSlots,
      canAddMoreBsns,
      canExpand,
      addPendingExpansion,
      updateExpansionStatus,
      refetchExpansions,
    }),
    [
      // State values that change
      hasError,
      processing,
      errorMessage,
      formData,
      step,
      verifiedDelegation,
      expansionStepOptions,
      expansionHistoryModalOpen,
      expansionHistoryTargetDelegation,
      verifiedExpansionModalOpen,
      selectedDelegationForVerifiedModal,
      isExpansionModalOpen,
      expansions,
      maxFinalityProviders,
      // Stable callbacks - ESLint requires them but they don't cause re-renders
      goToStep,
      setProcessing,
      setFormData,
      setVerifiedDelegation,
      reset,
      setExpansionStepOptions,
      setExpansionHistoryModalOpen,
      openExpansionHistoryModal,
      closeExpansionHistoryModal,
      setVerifiedExpansionModalOpen,
      setSelectedDelegationForVerifiedModal,
      getAvailableBsnSlots,
      canAddMoreBsns,
      canExpand,
      addPendingExpansion,
      updateExpansionStatus,
      refetchExpansions,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useStakingExpansionState };

import { useCallback, useMemo, type PropsWithChildren } from "react";

import { DEFAULT_BTC_CONFIRMATION_DEPTH } from "@/ui/common/constants";
import { useExpansionHistoryService } from "@/ui/common/hooks/services/useExpansionHistoryService";
import { useVerifiedStakingExpansionService } from "@/ui/common/hooks/services/useVerifiedStakingExpansionService";
import { useAppState } from "@/ui/common/state";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import { StakingExpansionStep } from "@/ui/common/state/StakingExpansionTypes";
import {
  DelegationV2StakingState,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

export interface ExpansionInfo {
  canExpand: boolean;
  canPerformExpansionActions: boolean;
  currentBsnCount: number;
  maxFinalityProviders: number;
  expansionHistoryCount: number;
  hasVerifiedExpansions: boolean;
  verifiedExpansionCount: number;
  isPendingExpansion: boolean;
  confirmationDepth: number;
}

interface ExpansionCardState {
  getExpansionInfo: (delegation: DelegationWithFP) => ExpansionInfo;
  handleAddBsnFp: (delegation: DelegationWithFP) => void;
  handleRenewStakingTerm: (delegation: DelegationWithFP) => void;
  handleExpansionHistory: (delegation: DelegationWithFP) => void;
  handleVerifiedExpansion: (delegation: DelegationWithFP) => void;
}

const { StateProvider, useState: useExpansionCardState } =
  createStateUtils<ExpansionCardState>({
    getExpansionInfo: () => ({
      canExpand: false,
      canPerformExpansionActions: false,
      currentBsnCount: 0,
      maxFinalityProviders: 0,
      expansionHistoryCount: 0,
      hasVerifiedExpansions: false,
      verifiedExpansionCount: 0,
      isPendingExpansion: false,
      confirmationDepth: DEFAULT_BTC_CONFIRMATION_DEPTH,
    }),
    handleAddBsnFp: () => {},
    handleRenewStakingTerm: () => {},
    handleExpansionHistory: () => {},
    handleVerifiedExpansion: () => {},
  });

export function ExpansionCardState({ children }: PropsWithChildren) {
  const {
    goToStep,
    setFormData,
    processing,
    maxFinalityProviders,
    canExpand,
    openExpansionHistoryModal,
  } = useStakingExpansionState();

  const { delegations } = useDelegationV2State();
  const { getHistoryCount } = useExpansionHistoryService();
  const {
    openVerifiedExpansionModalForDelegation,
    getVerifiedExpansionInfoForDelegation,
  } = useVerifiedStakingExpansionService();

  const { isLoading: isUTXOsLoading, networkInfo } = useAppState();

  const getExpansionInfo = useCallback(
    (delegation: DelegationWithFP): ExpansionInfo => {
      const currentBsnCount = delegation.finalityProviderBtcPksHex.length;
      const canExpandDelegation = canExpand(delegation);

      // Check both local canExpand (slot availability) and API canExpand field
      const canPerformExpansionActions =
        canExpandDelegation && // Local check: available FP slots
        delegation.canExpand !== false; // API check: delegation is expandable

      // Calculate actual expansion history count
      const expansionHistoryCount = getHistoryCount(
        delegations,
        delegation.stakingTxHashHex,
      );

      // Get verified expansion info for this specific delegation
      const delegationVerifiedExpansionInfo =
        getVerifiedExpansionInfoForDelegation(delegation.stakingTxHashHex);

      // Check if this is a pending expansion transaction
      const isPendingExpansion = Boolean(
        delegation.previousStakingTxHashHex &&
          (delegation.state ===
            DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION ||
            delegation.state === DelegationV2StakingState.VERIFIED),
      );

      // Get confirmation requirements from network info
      const confirmationDepth =
        networkInfo?.params?.btcEpochCheckParams.latestParam
          .btcConfirmationDepth ?? DEFAULT_BTC_CONFIRMATION_DEPTH;

      return {
        canExpand: canExpandDelegation,
        canPerformExpansionActions,
        currentBsnCount,
        maxFinalityProviders,
        expansionHistoryCount,
        hasVerifiedExpansions:
          delegationVerifiedExpansionInfo.hasVerifiedExpansions,
        verifiedExpansionCount: delegationVerifiedExpansionInfo.count,
        isPendingExpansion,
        confirmationDepth,
      };
    },
    [
      canExpand,
      getHistoryCount,
      delegations,
      getVerifiedExpansionInfoForDelegation,
      maxFinalityProviders,
      networkInfo,
    ],
  );

  const handleAddBsnFp = useCallback(
    (delegation: DelegationWithFP) => {
      const expansionInfo = getExpansionInfo(delegation);

      if (!expansionInfo.canPerformExpansionActions) {
        console.warn("Cannot expand: expansion not allowed");
        return;
      }

      if (processing) {
        console.warn("Cannot start expansion: another operation in progress");
        return;
      }

      if (isUTXOsLoading) {
        console.warn("Cannot start expansion: UTXOs are still loading");
        return;
      }

      // Initialize expansion form data with current delegation
      const initialFormData = {
        originalDelegation: delegation,
        selectedBsnFps: {},
        feeRate: 0,
        feeAmount: 0,
        stakingTimelock: 0,
      };

      setFormData(initialFormData);
      goToStep(StakingExpansionStep.BSN_FP_SELECTION);
    },
    [getExpansionInfo, processing, isUTXOsLoading, setFormData, goToStep],
  );

  const handleRenewStakingTerm = useCallback(
    (delegation: DelegationWithFP) => {
      const expansionInfo = getExpansionInfo(delegation);

      if (!expansionInfo.canPerformExpansionActions) {
        return;
      }

      if (processing) {
        return;
      }

      if (isUTXOsLoading) {
        return;
      }

      // Initialize expansion form data with current delegation and empty selectedBsnFps
      // This signals we're doing a renewal-only operation
      const renewalFormData = {
        originalDelegation: delegation,
        selectedBsnFps: {}, // Empty - no new BSN/FP pairs
        feeRate: 0,
        feeAmount: 0,
        stakingTimelock: 0, // Will be set during the renewal process
        isRenewalOnly: true, // Flag to indicate this is a renewal-only operation
      };

      setFormData(renewalFormData);
      // Go to renewal timelock modal to show the new staking term
      goToStep(StakingExpansionStep.RENEWAL_TIMELOCK);
    },
    [getExpansionInfo, processing, isUTXOsLoading, setFormData, goToStep],
  );

  const handleExpansionHistory = useCallback(
    (delegation: DelegationWithFP) => {
      const expansionInfo = getExpansionInfo(delegation);
      if (expansionInfo.expansionHistoryCount > 0) {
        openExpansionHistoryModal(delegation);
      }
    },
    [getExpansionInfo, openExpansionHistoryModal],
  );

  const handleVerifiedExpansion = useCallback(
    (delegation: DelegationWithFP) => {
      openVerifiedExpansionModalForDelegation(delegation);
    },
    [openVerifiedExpansionModalForDelegation],
  );

  const state: ExpansionCardState = useMemo(
    () => ({
      getExpansionInfo,
      handleAddBsnFp,
      handleRenewStakingTerm,
      handleExpansionHistory,
      handleVerifiedExpansion,
    }),
    [
      getExpansionInfo,
      handleAddBsnFp,
      handleRenewStakingTerm,
      handleExpansionHistory,
      handleVerifiedExpansion,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useExpansionCardState };

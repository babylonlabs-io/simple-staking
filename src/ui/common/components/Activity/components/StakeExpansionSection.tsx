import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Text,
} from "@babylonlabs-io/core-ui";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

import iconBSNFp from "@/ui/common/assets/expansion-bsn-fp.svg";
import iconHistory from "@/ui/common/assets/expansion-history.svg";
import iconRenew from "@/ui/common/assets/expansion-renew.svg";
import iconVerified from "@/ui/common/assets/expansion-verified.svg";
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

import { ExpansionButton } from "./ExpansionButton";

interface StakeExpansionSectionProps {
  delegation: DelegationWithFP;
}

export function StakeExpansionSection({
  delegation,
}: StakeExpansionSectionProps) {
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

  const currentBsnCount = delegation.finalityProviderBtcPksHex.length;
  const canExpandDelegation = canExpand(delegation);

  // Check both local canExpand (slot availability) and API canExpand field
  const canPerformExpansionActions =
    canExpandDelegation && // Local check: available FP slots
    delegation.canExpand !== false; // API check: delegation is expandable

  const handleAddBsnFp = () => {
    if (!canPerformExpansionActions) {
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
  };

  /**
   * Handle renew staking term button click.
   * This allows users to renew the timelock without adding new BSN/FP pairs.
   */
  const handleRenewStakingTerm = () => {
    if (!canPerformExpansionActions) {
      return;
    }

    if (processing) {
      // Cannot start renewal: another operation in progress
      return;
    }

    if (isUTXOsLoading) {
      // Cannot start renewal: UTXOs are still loading
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
  };

  /**
   * Handle expansion history button click.
   */
  const handleExpansionHistory = () => {
    if (expansionHistoryCount > 0) {
      openExpansionHistoryModal(delegation);
    }
  };

  /**
   * Handle verified expansion button click.
   */
  const handleVerifiedExpansion = () => {
    openVerifiedExpansionModalForDelegation(delegation);
  };

  // Calculate actual expansion history count
  const expansionHistoryCount = getHistoryCount(
    delegations,
    delegation.stakingTxHashHex,
  );

  // Get verified expansion info for this specific delegation
  const delegationVerifiedExpansionInfo = getVerifiedExpansionInfoForDelegation(
    delegation.stakingTxHashHex,
  );

  // Check if this is a pending expansion transaction
  const isPendingExpansion =
    delegation.previousStakingTxHashHex &&
    (delegation.state ===
      DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION ||
      delegation.state === DelegationV2StakingState.VERIFIED);

  // Get confirmation requirements from network info
  const confirmationDepth =
    networkInfo?.params?.btcEpochCheckParams.latestParam.btcConfirmationDepth ??
    6;

  return (
    <div className="w-full">
      {isPendingExpansion && (
        <div className="mb-4 p-4 bg-warning-surface border border-warning-strokeLight rounded">
          <Text
            variant="body1"
            className="text-accent-primary font-medium mb-2"
          >
            Stake Expansion Pending
          </Text>
          <Text variant="body2" className="text-accent-secondary">
            Your stake expansion transaction has been forwarded to Bitcoin. It
            will be activated once it receives {confirmationDepth} Bitcoin block
            confirmations. Your original stake is still Active and you can find
            it in the "Expansion History" tab.
          </Text>
        </div>
      )}
      <Accordion className="border border-secondary-strokeLight rounded bg-surface">
        <AccordionSummary
          className="p-4"
          renderIcon={(expanded) =>
            expanded ? (
              <AiOutlineMinus size={16} />
            ) : (
              <AiOutlinePlus size={16} />
            )
          }
          iconClassName="mr-4"
        >
          <Text variant="body1" className="text-accent-primary font-medium">
            Stake Expansion
          </Text>
        </AccordionSummary>
        <AccordionDetails className="px-4 pb-4 space-y-3">
          <div className="flex flex-col gap-4 w-full">
            <ExpansionButton
              Icon={iconBSNFp}
              text="Add BSNs and Finality Providers"
              counter={`${currentBsnCount}/${maxFinalityProviders}`}
              onClick={handleAddBsnFp}
              disabled={
                !canPerformExpansionActions || processing || isUTXOsLoading
              }
            />
            <ExpansionButton
              Icon={iconRenew}
              text="Renew Staking Term"
              onClick={handleRenewStakingTerm}
              disabled={
                !canPerformExpansionActions || processing || isUTXOsLoading
              }
            />
            <ExpansionButton
              Icon={iconHistory}
              text="Expansion History"
              counter={
                expansionHistoryCount > 0
                  ? `${expansionHistoryCount}`
                  : undefined
              }
              onClick={handleExpansionHistory}
              disabled={
                expansionHistoryCount === 0 || processing || isUTXOsLoading
              }
            />
            {delegationVerifiedExpansionInfo.hasVerifiedExpansions && (
              <ExpansionButton
                Icon={iconVerified}
                text="Verified Stake Expansion"
                counter={`${delegationVerifiedExpansionInfo.count}`}
                onClick={handleVerifiedExpansion}
                disabled={
                  !delegationVerifiedExpansionInfo.hasVerifiedExpansions ||
                  processing ||
                  isUTXOsLoading
                }
              />
            )}
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

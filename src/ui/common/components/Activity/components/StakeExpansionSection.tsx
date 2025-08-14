import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Text,
} from "@babylonlabs-io/core-ui";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

import iconBSNFp from "@/ui/common/assets/expansion-bsn-fp.svg";
import iconHistory from "@/ui/common/assets/expansion-history.svg";
import { useExpansionHistoryService } from "@/ui/common/hooks/services/useExpansionHistoryService";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import { StakingExpansionStep } from "@/ui/common/state/StakingExpansionTypes";
import { DelegationWithFP } from "@/ui/common/types/delegationsV2";

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

  const currentBsnCount = delegation.finalityProviderBtcPksHex.length;
  const canExpandDelegation = canExpand(delegation);

  const handleAddBsnFp = () => {
    if (!canExpandDelegation) {
      console.warn("Cannot expand: maximum BSN count reached");
      return;
    }

    if (processing) {
      console.warn("Cannot start expansion: another operation in progress");
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
   * Handle expansion history button click.
   */
  const handleExpansionHistory = () => {
    if (expansionHistoryCount > 0) {
      openExpansionHistoryModal(delegation);
    }
  };

  // Calculate actual expansion history count
  const expansionHistoryCount = getHistoryCount(
    delegations,
    delegation.stakingTxHashHex,
  );

  return (
    <div className="w-full">
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
              disabled={!canExpandDelegation || processing}
            />
            {expansionHistoryCount > 0 && (
              <ExpansionButton
                Icon={iconHistory}
                text="Expansion History"
                counter={`${expansionHistoryCount}`}
                onClick={handleExpansionHistory}
                disabled={processing}
              />
            )}
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

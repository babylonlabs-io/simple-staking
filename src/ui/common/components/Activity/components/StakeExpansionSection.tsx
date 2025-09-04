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
import { useExpansionCardState } from "@/ui/common/state/ExpansionCardState";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import { DelegationWithFP } from "@/ui/common/types/delegationsV2";

import { ExpansionButton } from "./ExpansionButton";

interface StakeExpansionSectionProps {
  delegation: DelegationWithFP;
}

export function StakeExpansionSection({
  delegation,
}: StakeExpansionSectionProps) {
  const { processing } = useStakingExpansionState();

  const {
    getExpansionInfo,
    handleAddBsnFp,
    handleRenewStakingTerm,
    handleExpansionHistory,
    handleVerifiedExpansion,
  } = useExpansionCardState();

  // Get all expansion information for this delegation
  const expansionInfo = getExpansionInfo(delegation);

  return (
    <div className="w-full">
      {expansionInfo.isPendingExpansion && (
        <div className="mb-4 p-4 bg-warning-surface border border-warning-strokeLight rounded">
          <Text
            variant="body1"
            className="text-accent-primary font-medium mb-2"
          >
            Stake Expansion Pending
          </Text>
          <Text variant="body2" className="text-accent-secondary">
            Your stake expansion transaction has been forwarded to Bitcoin. It
            will be activated once it receives {expansionInfo.confirmationDepth}{" "}
            Bitcoin block confirmations. Your original stake is still Active and
            you can find it in the "Expansion History" tab.
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
              counter={`${expansionInfo.currentBsnCount}/${expansionInfo.maxFinalityProviders}`}
              onClick={() => handleAddBsnFp(delegation)}
              disabled={!expansionInfo.canPerformExpansionActions || processing}
            />
            <ExpansionButton
              Icon={iconRenew}
              text="Renew Staking Term"
              onClick={() => handleRenewStakingTerm(delegation)}
              disabled={!expansionInfo.canPerformExpansionActions || processing}
            />
            <ExpansionButton
              Icon={iconHistory}
              text="Expansion History"
              counter={
                expansionInfo.expansionHistoryCount > 0
                  ? `${expansionInfo.expansionHistoryCount}`
                  : undefined
              }
              onClick={() => handleExpansionHistory(delegation)}
              disabled={expansionInfo.expansionHistoryCount === 0 || processing}
            />
            {expansionInfo.hasVerifiedExpansions && (
              <ExpansionButton
                Icon={iconVerified}
                text="Verified Stake Expansion"
                counter={`${expansionInfo.verifiedExpansionCount}`}
                onClick={() => handleVerifiedExpansion(delegation)}
                disabled={!expansionInfo.hasVerifiedExpansions || processing}
              />
            )}
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

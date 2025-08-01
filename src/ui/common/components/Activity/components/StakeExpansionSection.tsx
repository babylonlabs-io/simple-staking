import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Text,
} from "@babylonlabs-io/core-ui";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

import iconBSNFp from "@/ui/common/assets/expansion-bsn-fp.svg";
import iconHistory from "@/ui/common/assets/expansion-history.svg";
import { DelegationWithFP } from "@/ui/common/types/delegationsV2";

import { ExpansionButton } from "./ExpansionButton";

interface StakeExpansionSectionProps {
  delegation: DelegationWithFP;
}

export function StakeExpansionSection({
  delegation,
}: StakeExpansionSectionProps) {
  // Count current BSNs
  const currentBsnCount = delegation.finalityProviderBtcPksHex?.length;
  const maxBsnCount = 3;

  // Count expansion history, 0 is regular staking, 1+ is expanded
  const expansionHistoryCount = delegation.previousStakingTxHashHex ? "1+" : 0;

  const handleAddBsnFp = () => {
    console.log(`add bsn/fp, staking tx: ${delegation.stakingTxHashHex}`);
  };

  const handleExpansionHistory = () => {
    console.log(
      `expansion history clicked, staking tx: ${delegation.stakingTxHashHex}`,
    );
  };

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
              counter={`${currentBsnCount}/${maxBsnCount}`}
              onClick={handleAddBsnFp}
            />
            <ExpansionButton
              Icon={iconHistory}
              text="Expansion History"
              counter={`${expansionHistoryCount}`}
              onClick={handleExpansionHistory}
            />
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

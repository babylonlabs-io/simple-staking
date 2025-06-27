import { Card } from "@babylonlabs-io/core-ui";

import { DelegationCardAddBSNs } from "./components/DelegationCardAddBSNs";
import { DelegationCardAmountSection } from "./components/DelegationCardAmountSection";
import { DelegationCardDetailsSection } from "./components/DelegationCardDetailsSection";
import { DelegationCardHeader } from "./components/DelegationCardHeader";

export interface DelegationCardData {
  formattedAmount: string;
  status: string;
  inception: string;
  txHash: string;
  bsn?: string;
  finalityProvider?: string;
  reward?: string;
  showAddBSNs?: boolean;
}

interface DelegationCardProps {
  data: DelegationCardData;
  onUnbond?: () => void;
  onAddBSNs?: () => void;
  onFilter?: () => void;
}

export function DelegationCard({
  data,
  onUnbond,
  onAddBSNs,
  onFilter,
}: DelegationCardProps) {
  return (
    <Card className="w-full">
      <DelegationCardHeader onFilter={onFilter} />

      <div className="bg-secondary-highlight p-3 sm:p-4 space-y-3 sm:space-y-4">
        <DelegationCardAmountSection
          formattedAmount={data.formattedAmount}
          onUnbond={onUnbond}
        />

        <DelegationCardDetailsSection
          status={data.status}
          inception={data.inception}
          txHash={data.txHash}
          bsn={data.bsn}
          finalityProvider={data.finalityProvider}
          reward={data.reward}
        />

        {data.showAddBSNs && <DelegationCardAddBSNs onAddBSNs={onAddBSNs} />}
      </div>
    </Card>
  );
}

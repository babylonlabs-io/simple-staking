import { Hash } from "@/ui/components/Hash/Hash";

interface DelegationDetailsSectionProps {
  status: string;
  inception: string;
  txHash: string;
  bsn?: string;
  finalityProvider?: string;
  reward?: string;
}

interface DetailRowProps {
  label: string;
  value: string | React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0 overflow-x-auto">
      <span className="text-xs sm:text-sm text-accent-secondary flex-shrink-0">
        {label}
      </span>
      <span className="text-xs sm:text-sm text-accent-primary font-medium text-right min-w-0 overflow-x-auto whitespace-nowrap">
        {value}
      </span>
    </div>
  );
}

export function DelegationCardDetailsSection({
  status,
  inception,
  txHash,
  bsn,
  finalityProvider,
  reward,
}: DelegationDetailsSectionProps) {
  const hasOptionalDetails = bsn || finalityProvider || reward;

  return (
    <div className="space-y-3 sm:space-y-4 overflow-x-auto">
      <div className="space-y-4 sm:space-y-6">
        <DetailRow label="Status" value={status} />
        <DetailRow label="Inception" value={inception} />
        <DetailRow
          label="Tx Hash"
          value={<Hash value={txHash} address small noFade />}
        />
      </div>

      {hasOptionalDetails && (
        <div className="bg-surface p-3 sm:p-4 rounded space-y-3 sm:space-y-4 overflow-x-auto">
          {bsn && <DetailRow label="BSN" value={bsn} />}
          {finalityProvider && (
            <DetailRow label="Finality Provider" value={finalityProvider} />
          )}
          {reward && <DetailRow label="Reward" value={reward} />}
        </div>
      )}
    </div>
  );
}

import { Button } from "@babylonlabs-io/core-ui";

import bitcoin from "@/ui/assets/bitcoin.png";

interface DelegationAmountSectionProps {
  formattedAmount: string;
  onUnbond?: () => void;
}

export function DelegationCardAmountSection({
  formattedAmount,
  onUnbond,
}: DelegationAmountSectionProps) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <div className="flex items-center gap-2">
        <img src={bitcoin} alt="bitcoin" className="w-6 h-6 sm:w-8 sm:h-8" />
        <span className="text-base sm:text-lg font-medium text-accent-primary">
          {formattedAmount}
        </span>
      </div>

      <Button
        variant="contained"
        size="small"
        // TODO: add proper responsive handling on core-ui
        className="sm:bbn-btn-medium"
        onClick={onUnbond}
      >
        Unbond
      </Button>
    </div>
  );
}

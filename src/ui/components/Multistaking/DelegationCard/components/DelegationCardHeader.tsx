import { Heading } from "@babylonlabs-io/core-ui";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

interface DelegationCardHeaderProps {
  onFilter?: () => void;
}

export function DelegationCardHeader({ onFilter }: DelegationCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Heading variant="h6" className="text-accent-primary">
        Activity
      </Heading>
      <button
        onClick={onFilter}
        className="p-1 rounded hover:bg-secondary-highlight transition-colors"
        aria-label="Filter"
      >
        <HiOutlineAdjustmentsHorizontal
          size={20}
          className="text-accent-secondary hover:text-accent-primary transition-colors"
        />
      </button>
    </div>
  );
}

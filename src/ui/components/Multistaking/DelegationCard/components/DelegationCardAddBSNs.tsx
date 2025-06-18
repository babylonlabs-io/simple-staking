import { Button } from "@babylonlabs-io/core-ui";

interface AddBSNsSectionProps {
  onAddBSNs?: () => void;
}

export function DelegationCardAddBSNs({ onAddBSNs }: AddBSNsSectionProps) {
  return (
    <div className="mt-4 sm:mt-6">
      <Button
        variant="outlined"
        size="small"
        // TODO: add proper responsive handling on core-ui
        className="sm:bbn-btn-medium w-full text-accent-primary border-accent-secondary hover:bg-accent-primary/10"
        onClick={onAddBSNs}
      >
        Add BSNs
      </Button>
    </div>
  );
}

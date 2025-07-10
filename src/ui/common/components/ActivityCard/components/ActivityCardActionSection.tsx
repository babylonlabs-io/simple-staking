import { Button } from "@babylonlabs-io/core-ui";

import { ActivityCardActionButton } from "../ActivityCard";

interface ActivityCardActionSectionProps {
  actions: ActivityCardActionButton[];
}

export function ActivityCardActionSection({
  actions,
}: ActivityCardActionSectionProps) {
  return (
    <div className="mt-4 sm:mt-6 space-y-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "outlined"}
          size={action.size || "small"}
          className={`sm:bbn-btn-medium ${action.fullWidth ? "w-full" : ""} ${action.className || ""}`}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

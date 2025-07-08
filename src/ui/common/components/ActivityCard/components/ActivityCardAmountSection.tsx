import { Button } from "@babylonlabs-io/core-ui";

import { ActivityCardActionButton } from "../ActivityCard";

interface ActivityCardAmountSectionProps {
  formattedAmount: string;
  icon?: string | React.ReactNode;
  iconAlt?: string;
  primaryAction?: ActivityCardActionButton;
}

export function ActivityCardAmountSection({
  formattedAmount,
  icon,
  iconAlt,
  primaryAction,
}: ActivityCardAmountSectionProps) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <div className="flex items-center gap-2">
        {icon &&
          (typeof icon === "string" ? (
            <img
              src={icon}
              alt={iconAlt || "icon"}
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
          ) : (
            icon
          ))}
        <span className="text-base sm:text-lg font-medium text-accent-primary">
          {formattedAmount}
        </span>
      </div>

      {primaryAction && (
        <Button
          variant={primaryAction.variant || "contained"}
          size={primaryAction.size || "small"}
          className={`sm:bbn-btn-medium ${primaryAction.className || ""}`}
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </Button>
      )}
    </div>
  );
}

import { StakeExpansionSection } from "@/ui/common/components/Activity/components/StakeExpansionSection";
import { DelegationWithFP } from "@/ui/common/types/delegationsV2";
import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";

import { NonExpandableExpansion } from "../Activity/components/NonExpandableExpansion";

import { ActivityCardActionSection } from "./components/ActivityCardActionSection";
import { ActivityCardAmountSection } from "./components/ActivityCardAmountSection";
import { ActivityCardDetailsSection } from "./components/ActivityCardDetailsSection";

export interface ActivityCardDetailItem {
  label: string;
  value: string | React.ReactNode;
}

export interface ActivityListItemData {
  icon?: string | React.ReactNode;
  iconAlt?: string;
  name: string;
  id?: string;
}

export interface ActivityCardActionButton {
  label: string;
  onClick: () => void;
  variant?: "contained" | "outlined";
  size?: "small" | "medium" | "large";
  className?: string;
  fullWidth?: boolean;
}

export interface ActivityCardData {
  formattedAmount: string;
  icon?: string | React.ReactNode;
  iconAlt?: string;
  details: ActivityCardDetailItem[];
  optionalDetails?: ActivityCardDetailItem[];
  listItems?: {
    label: string;
    items: ActivityListItemData[];
  }[];
  groupedDetails?: {
    label?: string;
    items: ActivityCardDetailItem[];
  }[];
  primaryAction?: ActivityCardActionButton;
  secondaryActions?: ActivityCardActionButton[];
  expansionSection?: DelegationWithFP;
  hideExpansionCompletely?: boolean;
}

interface ActivityCardProps {
  data: ActivityCardData;
  className?: string;
}

export function ActivityCard({ data, className }: ActivityCardProps) {
  const shouldShowExpansion =
    FeatureFlagService.IsPhase3Enabled && !data.hideExpansionCompletely;

  return (
    <div
      className={`w-full bg-secondary-highlight p-3 sm:p-4 space-y-3 sm:space-y-4 rounded ${className || ""}`}
    >
      <ActivityCardAmountSection
        formattedAmount={data.formattedAmount}
        icon={data.icon}
        iconAlt={data.iconAlt}
        primaryAction={data.primaryAction}
      />

      <ActivityCardDetailsSection
        details={data.details}
        optionalDetails={data.optionalDetails}
        listItems={data.listItems}
        groupedDetails={data.groupedDetails}
      />

      {shouldShowExpansion &&
        (data.expansionSection ? (
          <StakeExpansionSection delegation={data.expansionSection} />
        ) : (
          <NonExpandableExpansion />
        ))}

      {data.secondaryActions && data.secondaryActions.length > 0 && (
        <ActivityCardActionSection actions={data.secondaryActions} />
      )}
    </div>
  );
}

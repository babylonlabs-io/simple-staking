import { ActivityCardDetailItem, ActivityListItemData } from "../ActivityCard";

import { ActivityListItem } from "./ActivityListItem";

interface ActivityCardDetailsSectionProps {
  details: ActivityCardDetailItem[];
  optionalDetails?: ActivityCardDetailItem[];
  listItems?: {
    label: string;
    items: ActivityListItemData[];
  }[];
}

interface DetailRowProps {
  label: string;
  value: string | React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0 overflow-x-auto">
      <span className="text-xs sm:text-sm text-accent-primary flex-shrink-0">
        {label}
      </span>
      <span className="text-xs sm:text-sm text-accent-primary font-medium text-right min-w-0 overflow-x-auto whitespace-nowrap">
        {value}
      </span>
    </div>
  );
}

export function ActivityCardDetailsSection({
  details,
  optionalDetails,
  listItems,
}: ActivityCardDetailsSectionProps) {
  const hasOptionalDetails = optionalDetails && optionalDetails.length > 0;
  const hasListItems = listItems && listItems.length > 0;

  return (
    <div className="space-y-3 sm:space-y-4 overflow-x-auto">
      <div className="space-y-4 sm:space-y-6">
        {details.map((detail, index) => (
          <DetailRow key={index} label={detail.label} value={detail.value} />
        ))}
      </div>

      {hasListItems && (
        <div className="space-y-3 sm:space-y-4">
          {listItems.map((listSection, sectionIndex) => (
            <div
              key={sectionIndex}
              className="bg-surface p-3 sm:p-4 rounded space-y-3 sm:space-y-4 overflow-x-auto"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs sm:text-sm text-accent-primary">
                  {listSection.label}
                </span>
                <div className="flex flex-wrap gap-2">
                  {listSection.items.map((item, itemIndex) => (
                    <ActivityListItem key={item.id || itemIndex} item={item} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasOptionalDetails && (
        <div className="bg-surface p-3 sm:p-4 rounded space-y-3 sm:space-y-4 overflow-x-auto">
          {optionalDetails.map((detail, index) => (
            <DetailRow key={index} label={detail.label} value={detail.value} />
          ))}
        </div>
      )}
    </div>
  );
}

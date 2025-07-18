import { twMerge } from "tailwind-merge";

export interface ActivityListItemData {
  icon?: string | React.ReactNode;
  iconAlt?: string;
  name: string;
  id?: string;
}

interface ActivityListItemProps {
  item: ActivityListItemData;
  className?: string;
}

export function ActivityListItem({ item, className }: ActivityListItemProps) {
  return (
    <div className={twMerge("flex items-center gap-2 min-w-0", className)}>
      <span className="text-xs sm:text-sm text-accent-primary font-medium truncate flex items-center">
        {item.name}
      </span>
      {item.icon && (
        <div className="flex items-center w-4 h-4 flex-shrink-0 justify-center text-xs sm:text-sm">
          {typeof item.icon === "string" ? (
            <img
              src={item.icon}
              alt={item.iconAlt || item.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            item.icon
          )}
        </div>
      )}
    </div>
  );
}

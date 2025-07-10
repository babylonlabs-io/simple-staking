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
    <div className={`flex items-center gap-2 min-w-0 ${className || ""}`}>
      <span className="text-xs sm:text-sm text-accent-primary font-medium truncate">
        {item.name}
      </span>
      {item.icon &&
        (typeof item.icon === "string" ? (
          <img
            src={item.icon}
            alt={item.iconAlt || item.name}
            className="w-4 h-4 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
            {item.icon}
          </div>
        ))}
    </div>
  );
}

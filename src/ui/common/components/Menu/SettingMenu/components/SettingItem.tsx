import { Text } from "@babylonlabs-io/core-ui";
import { twJoin } from "tailwind-merge";

import { ChevronRightIcon } from "@/ui/common/components/Icons";

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

export const SettingItem = ({
  icon,
  title,
  subtitle,
  onClick,
  className = "",
}: SettingItemProps) => {
  return (
    <button
      onClick={onClick}
      className={twJoin(
        "flex items-center justify-between w-full p-6",
        "hover:bg-accent-secondary/5 transition-colors",
        "text-left",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div className="flex flex-col">
          <Text
            variant="body1"
            className="text-accent-primary font-medium text-sm"
          >
            {title}
          </Text>
          {subtitle && (
            <Text variant="body2" className="text-accent-secondary text-xs">
              {subtitle}
            </Text>
          )}
        </div>
      </div>
      {onClick && (
        <ChevronRightIcon size={16} className="text-accent-secondary" />
      )}
    </button>
  );
};

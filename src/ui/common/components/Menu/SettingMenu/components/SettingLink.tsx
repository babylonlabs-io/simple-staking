import { Text } from "@babylonlabs-io/core-ui";
import { twJoin } from "tailwind-merge";

import { ChevronRightIcon } from "@/ui/common/components/Icons";

interface SettingLinkProps {
  icon?: React.ReactNode;
  title: string;
  href: string;
  className?: string;
}

export const SettingLink = ({
  icon,
  title,
  href,
  className = "",
}: SettingLinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={twJoin(
        "flex items-center justify-between w-full p-6",
        "hover:bg-accent-secondary/5 transition-colors",
        "text-left",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && icon}
        <Text
          variant="body1"
          className="text-accent-primary font-medium text-sm"
        >
          {title}
        </Text>
      </div>
      <ChevronRightIcon size={16} className="text-accent-secondary" />
    </a>
  );
};

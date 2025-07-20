import { Text } from "@babylonlabs-io/core-ui";
import { twMerge } from "tailwind-merge";

import { trim } from "@/ui/common/utils/trim";

interface DisplayHashProps {
  value: string;
  symbols?: number;
  size?: React.ComponentProps<typeof Text>["variant"];
  className?: string;
}

export const DisplayHash: React.FC<DisplayHashProps> = ({
  value,
  symbols = 8,
  size = "body2",
  className,
}) => {
  if (!value) {
    return;
  }

  return (
    <Text variant={size} className={twMerge("text-accent-primary", className)}>
      <span>{trim(value, symbols) ?? value}</span>
    </Text>
  );
};

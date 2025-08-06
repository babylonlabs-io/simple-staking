import { Text } from "@babylonlabs-io/core-ui";
import { twMerge } from "tailwind-merge";

import { ValidatorAvatar } from "../ValidatorAvatar";

interface ValidatorProps {
  logoUrl?: string;
  name: string;
  className?: string;
  size?: "large" | "small";
}

export function ValidatorItem({
  className,
  logoUrl,
  name,
  size = "large",
}: ValidatorProps) {
  return (
    <div className={twMerge("flex items-center gap-2", className)}>
      <ValidatorAvatar
        url={logoUrl}
        name={name}
        variant="rounded"
        size={size}
      />

      <Text variant="body2" className="text-accent-primary">
        {name}
      </Text>
    </div>
  );
}

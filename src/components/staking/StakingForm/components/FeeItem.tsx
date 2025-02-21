import { Text } from "@babylonlabs-io/bbn-core-ui";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

interface FeeItemProps extends PropsWithChildren {
  title: string;
  className?: string;
  hint?: string;
}

export function FeeItem({ title, children, className, hint }: FeeItemProps) {
  return (
    <div
      className={twMerge(
        "flex flex-row items-center justify-between text-accent-primary",
        hint && "items-start",
        className,
      )}
    >
      <Text as="div" variant="body1">
        {title}
      </Text>

      {!hint ? (
        <Text as="div" className="flex gap-2 items-center">
          {children}
        </Text>
      ) : (
        <div className="flex flex-col items-end">
          <Text as="div" className="flex gap-2 items-center">
            {children}
          </Text>
          <Text as="div" variant="body2" className="text-accent-secondary">
            {hint}
          </Text>
        </div>
      )}
    </div>
  );
}

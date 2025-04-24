import type { HTMLAttributes, ReactNode } from "react";
import { Heading } from "@babylonlabs-io/core-ui";

import { cx } from "../../utils/cx";

export interface EmptyPromptProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  customSubtitle?: ReactNode;
  cta?: ReactNode;
}

export const EmptyPrompt = ({
  title,
  subtitle,
  customSubtitle,
  cta,
  className,
}: EmptyPromptProps) => {
  return (
    <div className={cx("flex items-center justify-center", className)}>
      <div className="container mx-auto text-center">
        <div className="space-y-3">
          <Heading
            variant="h5"
            className="text-accent-primary text-center text-2xl"
          >
            {title}
          </Heading>
          {subtitle && (
            <p className="font-medium text-callout text-itemSecondaryDefault text-balance">
              {subtitle}
            </p>
          )}
        </div>
        {cta && <div className="mt-6">{cta}</div>}
        {customSubtitle && !subtitle && customSubtitle}
      </div>
    </div>
  );
};

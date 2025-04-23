import type { HTMLAttributes, ReactNode } from "react";

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
          <h3 className="font-sans font-bold text-body1">{title}</h3>
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

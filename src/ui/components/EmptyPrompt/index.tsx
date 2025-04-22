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
      <div className="container mx-auto space-y-4 text-center">
        <h3 className="font-sans font-bold text-body1">{title}</h3>
        {subtitle && (
          <p className="font-semibold text-callout text-itemSecondaryDefault text-balance">
            {subtitle}
          </p>
        )}
        {cta && <div className="mt-4">{cta}</div>}
        {customSubtitle && !subtitle && customSubtitle}
      </div>
    </div>
  );
};

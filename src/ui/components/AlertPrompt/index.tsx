import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { Icon } from "../Icon";
import { PromptBox } from "../PromptBox";

export interface AlertPromptProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  hint?: ReactNode | ReactNode[];
  cta?: ReactNode | null;
  iconClassName?: string;
}

export const AlertPrompt = ({
  title,
  subtitle,
  hint,
  cta,
  iconClassName,
  className,
}: AlertPromptProps) => {
  return (
    <PromptBox className={className}>
      <Icon
        iconKey="alertFilled"
        className={cx(
          "text-itemErrorDefault mb-4 size-8 tuna:size-10",
          iconClassName,
        )}
      />
      <p className="mb-2 font-sans font-bold text-desktopBody1">{title}</p>
      {subtitle && (
        <p className="mb-6 font-semibold text-itemSecondaryDefault text-desktopBody3 text-balance">
          {subtitle}
        </p>
      )}
      {cta && (
        <div className="mx-auto mt-4 w-56 max-w-full *:w-full">{cta}</div>
      )}
      {hint && (
        <div className="flex items-center justify-center gap-2 mt-4 font-semibold text-callout text-withLink">
          {hint}
        </div>
      )}
    </PromptBox>
  );
};

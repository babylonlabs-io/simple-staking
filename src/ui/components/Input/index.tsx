"use client";

import type { ForwardedRef, PropsWithChildren, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { Button } from "../Button";
import { Label, type LabelProps } from "../Label";
import { Tooltip, type TooltipProps } from "../Tooltip";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "children"> {
  invalid?: boolean;
  hint?: string | ReactNode;
  hintTooltip?: TooltipProps;
  hintClassName?: string;
  label?: string | ReactNode;
  labelProps?: LabelProps;
  buttonHelper?: ReactNode;
  ref?: ForwardedRef<HTMLInputElement>;
}

export const inputSharedStyles = cx(
  "peer flex w-full rounded-0 py-[11px] px-3 flounder:px-4 flounder:pt-[14px] flounder:pb-[15px] !text-callout transition-shadow font-normal leading-none",
  "placeholder:!text-callout placeholder:font-medium placeholder:text-neutral70",
  "ring-1 ring-inset ring-itemPrimaryMute bg-backgroundPrimaryDefault text-itemPrimaryDefault disabled:text-neutral70 focus-visible:outline-none focus-visible:ring-itemSecondaryDefault disabled:cursor-not-allowed disabled:bg-backgroundPrimaryHighlight disabled:ring-itemPrimaryMute",
);

export const Hint = ({
  invalid,
  className,
  children,
}: PropsWithChildren<{ invalid?: boolean; className?: string }>) => {
  return (
    <span
      className={cx(
        "flex gap-1.5 !text-callout text-itemSecondaryDefault",
        invalid && "text-backgroundErrorOnDefault",
        className,
      )}
    >
      {children}
    </span>
  );
};

export const Input = ({
  invalid,
  id,
  name,
  label,
  disabled,
  labelProps,
  hint,
  hintTooltip,
  hintClassName,
  buttonHelper,
  className,
  ref,
  ...props
}: InputProps) => {
  const inputClassName = cx(
    inputSharedStyles,
    invalid && "ring-backgroundErrorOnDefault",
    className,
  );

  return (
    <div className="relative flex-1 space-y-1 text-left flounder:space-y-2">
      {label && (
        <Label htmlFor={id ?? name} disabled={disabled} {...labelProps}>
          {label}
        </Label>
      )}
      <div className="relative">
        <input
          className={inputClassName}
          id={id ?? name}
          ref={ref}
          disabled={disabled}
          name={name}
          {...props}
        />
        {buttonHelper}
      </div>
      {hint && (
        <Hint invalid={invalid} className={hintClassName}>
          <div className="flex items-center gap-2">
            <span
              className={cx(invalid ? "inputErrorMessage" : "inputMessage")}
            >
              {hint}
            </span>

            {hintTooltip && (
              <span className="block z-[2]">
                <Tooltip
                  content={hintTooltip.content}
                  dangerousContent={hintTooltip.dangerousContent}
                  triggerProps={{ className: "flex" }}
                  contentProps={{
                    className:
                      "flounder:max-w-[480px] px-4 py-3 [&_ul]:[list-style-position:inside]",
                  }}
                  className="flex !text-start font-mono"
                >
                  <Button
                    variant="text"
                    size="sm"
                    as="span"
                    icon={{ iconKey: "infoCircle", size: 16 }}
                    className="text-itemSecondaryDefault"
                  />
                </Tooltip>
              </span>
            )}
          </div>
        </Hint>
      )}
    </div>
  );
};
Input.displayName = "Input";

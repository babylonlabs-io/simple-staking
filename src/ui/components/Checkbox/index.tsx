"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type { ComponentPropsWithRef } from "react";

import { cx } from "../../utils";
import { Icon, type IconProps } from "../Icon";
import { Label, type LabelProps } from "../Label";

export interface CheckboxProps
  extends ComponentPropsWithRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  labelProps?: LabelProps;
  iconProps?: IconProps;
  wrapperClassName?: string;
}
export const Checkbox = ({
  className,
  children,
  label,
  id,
  disabled,
  iconProps,
  labelProps,
  wrapperClassName,
  ref,
  ...props
}: CheckboxProps) => (
  <div className={cx("flex items-center gap-2", wrapperClassName)}>
    <CheckboxPrimitive.Root
      ref={ref}
      className={cx(
        "peer flex items-center justify-center size-[13px] rounded-sm min-w-[13px] focus-visible:outline-none cursor-pointer",
        "bg-backgroundPrimaryDefault transition-colors ring-1 ring-itemSecondaryHighlight ring-inset",
        "hover:bg-backgroundPrimaryHighlight hover:ring-itemSecondaryHighlight",
        "data-[state=checked]:bg-backgroundPrimaryActive data-[state=checked]:ring-itemSecondaryHighlight data-[state=checked]:ring-[1.5px]",
        disabled &&
          "opacity-50 pointer-events-none !bg-backgroundPrimaryHighlight !ring-itemSecondaryDefault",
        className,
      )}
      id={id}
      disabled={disabled}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center size-full clear-inline-indents">
        <Icon iconKey="check" size={10} {...iconProps} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    {label ? (
      <Label
        htmlFor={id}
        disabled={disabled}
        {...labelProps}
        className={cx(
          "font-mono cursor-pointer select-none",
          labelProps?.className,
        )}
      >
        {label}
      </Label>
    ) : (
      children
    )}
  </div>
);
Checkbox.displayName = "Checkbox";

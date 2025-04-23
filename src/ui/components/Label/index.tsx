"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import type { ComponentPropsWithRef } from "react";

import { cx } from "../../utils";
import { Icon, type IconProps } from "../Icon";
import { Tooltip, type TooltipProps } from "../Tooltip";

export interface LabelProps
  extends ComponentPropsWithRef<typeof LabelPrimitive.Root> {
  disabled?: boolean;
  tooltip?: string;
  iconProps?: IconProps;
  tooltipProps?: Omit<TooltipProps, "content" | "children">;
}
export const Label = ({
  className,
  tooltip,
  children,
  iconProps,
  tooltipProps,
  htmlFor,
  disabled,
  ref,
  ...props
}: LabelProps) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cx(
      "text-callout font-semibold font-sans flex items-center gap-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-25",
      disabled && "cursor-not-allowed opacity-25 pointer-events-none",
      className,
    )}
    asChild
    {...props}
  >
    <label htmlFor={htmlFor}>
      <span>{children}</span>

      {tooltip && (
        <Tooltip content={tooltip} {...tooltipProps}>
          <Icon
            iconKey="infoCircle"
            size={14}
            className="transition-colors text-itemSecondaryDefault hover:text-itemPrimaryDefault"
            {...iconProps}
          />
        </Tooltip>
      )}
    </label>
  </LabelPrimitive.Root>
);
Label.displayName = "Label";

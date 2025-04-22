"use client";

import type * as T from "@radix-ui/react-tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ForwardedRef, type ReactNode, useState } from "react";

import { cx } from "../../utils";

export interface TooltipProps extends T.TooltipProps {
  children: ReactNode | ReactNode[];
  content: ReactNode | ReactNode[] | string;
  contentProps?: T.TooltipContentProps;
  triggerProps?: T.TooltipTriggerProps;
  dangerousContent?: boolean;
  className?: string;
  arrowProps?: T.TooltipArrowProps;
  portalProps?: T.TooltipPortalProps;
  ref?: ForwardedRef<HTMLDivElement>;
}

export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = TooltipPrimitive.Content;
export const TooltipArrow = TooltipPrimitive.Arrow;

export const Tooltip = ({
  open,
  defaultOpen,
  onOpenChange,
  className,
  children,
  content,
  dangerousContent,
  delayDuration,
  contentProps,
  triggerProps,
  arrowProps,
  portalProps,
  ref,
  ...props
}: TooltipProps) => {
  const { className: triggerClassName, ...restTriggerProps } =
    triggerProps || {};
  const [isOpen, setOpen] = useState(open || false);

  return (
    <TooltipProvider delayDuration={delayDuration ?? 0} skipDelayDuration={0}>
      <TooltipRoot
        delayDuration={delayDuration ?? 0}
        open={isOpen}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        {...props}
      >
        <TooltipTrigger
          asChild
          onMouseEnter={() => {
            setOpen(true);
          }}
          onMouseLeave={() => {
            setOpen(false);
          }}
          onFocus={() => {
            setOpen(true);
          }}
          onBlur={() => {
            setOpen(false);
          }}
          {...restTriggerProps}
        >
          <span
            tabIndex={-1}
            className={cx(
              "relative inline-block cursor-pointer",
              triggerClassName,
            )}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipPrimitive.Portal {...portalProps}>
          <TooltipPrimitive.Content
            ref={ref}
            sideOffset={5}
            side="top"
            align="center"
            {...contentProps}
            className={cx(
              "animate-in data-[state=closed]:animate-out",
              "z-50 font-medium font-sans bg-neutral0 px-4 py-2.5 !text-callout text-neutral90 max-w-64 relative",
              contentProps?.className,
              className,
            )}
          >
            {dangerousContent && typeof content === "string" ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              content
            )}
            <TooltipArrow offset={5} width={11} height={5} {...arrowProps} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipRoot>
    </TooltipProvider>
  );
};
Tooltip.displayName = "Tooltip";

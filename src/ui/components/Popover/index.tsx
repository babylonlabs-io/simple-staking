import type * as T from "@radix-ui/react-popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentPropsWithoutRef, ForwardedRef } from "react";

import { cx } from "../../utils";
import { Icon } from "../Icon";

export const Root = ({
  ...props
}: ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) => (
  <PopoverPrimitive.Root {...props} />
);
export const Close = PopoverPrimitive.Close;
export const Anchor = PopoverPrimitive.Anchor;
export const Arrow = PopoverPrimitive.Arrow;

export interface PopoverContentProps extends T.PopoverContentProps {
  hideCloseButton?: boolean;
  hideArrow?: boolean;
  arrowClassName?: string;
  ref?: ForwardedRef<HTMLDivElement>;
}

export const Trigger = ({ children, ...props }: T.PopoverTriggerProps) => (
  <PopoverPrimitive.Trigger asChild {...props}>
    <span tabIndex={-1} className="relative leading-[0px] outline-none">
      {children}
    </span>
  </PopoverPrimitive.Trigger>
);

export const Content = ({
  className,
  align = "center",
  sideOffset = 16,
  children,
  hideCloseButton,
  hideArrow = true,
  arrowClassName,
  ref,
  ...props
}: PopoverContentProps) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cx(
        "data-[state=open]:animate-scaleIn data-[state=closed]:animate-out",
        "z-50 p-5 w-[480px] max-w-full bg-backgroundPrimaryDefault text-backgroundPrimaryOnDefault shadow-popover border border-itemSecondaryMute outline-none",
        className,
      )}
      {...props}
    >
      {!hideCloseButton && (
        <Close className="absolute right-4 top-4 focus:outline-none z-[2]">
          <Icon iconKey="close" size={24} />
          <span className="sr-only">Close</span>
        </Close>
      )}
      {children}
      {!hideArrow && (
        <span className={cx("text-itemSecondaryMute", arrowClassName)}>
          <Arrow
            offset={5}
            width={11}
            height={5}
            className="[fill:currentColor]"
          />
        </span>
      )}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
);
Content.displayName = PopoverPrimitive.Content.displayName;

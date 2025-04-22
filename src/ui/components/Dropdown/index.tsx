"use client";

import type * as T from "@radix-ui/react-dropdown-menu";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentPropsWithRef, ForwardedRef } from "react";

import { cx } from "../../utils/cx";
import { ListItem, type NavItemProps } from "../Nav";

export interface DropdownContentProps extends T.DropdownMenuContentProps {
  contentClassName?: string;
  list?: NavItemProps[];
  ref?: ForwardedRef<HTMLDivElement>;
}
export interface DropdownMenuTriggerProps extends T.DropdownMenuTriggerProps {}

export const Sub = DropdownPrimitive.Sub;
export const SubTrigger = DropdownPrimitive.SubTrigger;
export const SubContent = DropdownPrimitive.SubContent;
export const Separator = DropdownPrimitive.Separator;
export const Root = ({
  ...props
}: ComponentPropsWithRef<typeof DropdownPrimitive.Root>) => (
  <DropdownPrimitive.Root {...props} />
);
export const Item = ({
  ...props
}: ComponentPropsWithRef<typeof DropdownPrimitive.Item>) => (
  <DropdownPrimitive.Item {...props} />
);
export const Trigger = ({ children, ...props }: DropdownMenuTriggerProps) => (
  <DropdownPrimitive.Trigger asChild {...props}>
    {children}
  </DropdownPrimitive.Trigger>
);

export const Label = ({
  children,
  className,
  ...props
}: T.DropdownMenuLabelProps) => (
  <DropdownPrimitive.Label
    className={cx("text-[12px] text-itemSecondaryDefault", className)}
    {...props}
  >
    {children}
  </DropdownPrimitive.Label>
);

export const Content = ({
  children,
  sideOffset = 16,
  alignOffset,
  align,
  className,
  list,
  ref,
  ...props
}: DropdownContentProps) => {
  const contentClassNames = cx(
    "bg-backgroundPrimaryDefault z-header py-2 pointer-events-auto shadow-portalInverse border border-itemSecondaryMute",
    "will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideDownAndFade data-[side=left]:animate-slideRightAndFade",
    className,
  );

  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        align={align}
        ref={ref}
        className={contentClassNames}
        {...props}
      >
        {list &&
          list.map(({ as, url, title, active, className, ...rest }, i) => {
            return (
              <Item key={i} className="outline-none" asChild>
                <ListItem
                  as={as}
                  url={url}
                  title={title}
                  active={active}
                  className={cx(
                    listItemStyles,
                    active && "!bg-backgroundPrimaryMute",
                    className,
                  )}
                  activeIconProps={{ iconKey: "checkCircleFilled", size: 14 }}
                  {...rest}
                />
              </Item>
            );
          })}
        {children}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  );
};

Root.displayName = "Dropdown.Root";
Trigger.displayName = "Dropdown.Trigger";
Trigger.displayName = "Dropdown.Label";
Content.displayName = "Dropdown.Content";

const listItemStyles =
  "flex w-full justify-between align-middle inline-flex items-center font-semibold whitespace-nowrap rounded-0 transition-colors focus-visible:outline-none disabled:pointer-events-none outline-none normal-case text-start w-full [&_span]:!m-0 flounder:text-callout text-desktopCallout gap-2 font-mono tracking-normal py-[6px] px-[14px] flounder:py-[6px] flounder:px-[14px] bg-transparent hover:bg-backgroundPrimaryHighlight hover:text-backgroundPrimaryOnHighlight mb-px";

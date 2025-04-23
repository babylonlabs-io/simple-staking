"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentPropsWithoutRef, ComponentPropsWithRef } from "react";

import { cx } from "../../utils";
import type { ButtonProps } from "../Button/types";
import { Tooltip } from "../Tooltip";

export interface TabsButtonProps
  extends Omit<
    ButtonProps,
    | "as"
    | "color"
    | "state"
    | "filled"
    | "border"
    | "padding"
    | "fullWidth"
    | "value"
    | "disabled"
  > {
  startIcon?: ButtonProps["startIcon"];
  endIcon?: ButtonProps["endIcon"];
  tooltip?: string;
}

export const Root = ({
  ...props
}: ComponentPropsWithRef<typeof TabsPrimitive.Root>) => (
  <TabsPrimitive.Root {...props} />
);
Root.displayName = "Tabs.Root";

export const List = ({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    ref={ref}
    className={cx("flex items-center", className)}
    {...props}
  />
);
List.displayName = "Tabs.List";

export interface TabsTriggerProps
  extends ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  tooltip?: string;
  bordered?: boolean;
}
export const Trigger = ({ className, tooltip, ...props }: TabsTriggerProps) => {
  const trigger = <TabsPrimitive.Trigger className={className} {...props} />;

  if (tooltip) {
    return <Tooltip content={tooltip}>{trigger}</Tooltip>;
  }

  return trigger;
};
Trigger.displayName = "Tabs.Trigger";

export const Content = ({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cx("!outline-none", className)}
    {...props}
  />
);
Content.displayName = "Tabs.Content";

export interface TabsGroupProps extends TabsPrimitive.TabsListProps {
  items: TabsTriggerProps[];
  separator?: boolean;
}
export const Group = ({
  items,
  className,
  separator,
  ...props
}: TabsGroupProps) => {
  return (
    <List
      className={cx(
        "relative z-[2]",
        "*:inline-flex *:items-center *:justify-center *:whitespace-nowrap *:px-3.5 *:py-1.5 *:text-itemSecondaryDefault *:!text-callout *:font-semibold *:uppercase",
        separator &&
          "after:absolute after:z-[-1] after:border-b after:border-solid after:border-itemSecondaryMute after:bottom-0 after:inset-x-0",
        className,
      )}
      {...props}
    >
      {items.map(({ className, bordered, value, ...item }, index) => (
        <Trigger
          className={cx(
            "data-[state=active]:bg-backgroundSecondaryActive data-[state=active]:text-backgroundSecondaryOnActive hover:bg-backgroundSecondaryActive hover:text-backgroundSecondaryOnActive",
            "disabled:cursor-default data-[state=active]:disabled:bg-backgroundSecondaryMute disabled:!text-backgroundSecondaryOnMute",
            "transition-[color,background] disabled:pointer-events-none focus:outline-none focus-visible:outline-none",
            bordered &&
              "border-solid border border-itemSecondaryMute bg-backgroundSecondaryActive -mr-px text-backgroundSecondaryOnActive data-[state=active]:border-b-transparent data-[state=active]:bg-backgroundPrimaryDefault data-[state=active]:text-backgroundPrimaryOnDefault hover:bg-backgroundSecondaryActive hover:text-backgroundSecondaryOnActive",
            className,
          )}
          value={value}
          data-value={value}
          tabIndex={0}
          key={index}
          {...item}
        />
      ))}
    </List>
  );
};
Group.displayName = "Tabs.Group";

"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import type { ComponentPropsWithRef } from "react";

import { cx } from "../../utils";

export type ToggleGroupProps = typeof ToggleGroupPrimitive.Root;
export const Group = ({
  className,
  children,
  ref,
  ...props
}: ComponentPropsWithRef<ToggleGroupProps>) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cx("flex items-center", className)}
    {...props}
  >
    {children}
  </ToggleGroupPrimitive.Root>
);
Group.displayName = "Toggle.Group";

export type ToggleGroupItemProps = typeof ToggleGroupPrimitive.Item;
export const GroupItem = ({
  className,
  children,
  ref,
  ...props
}: ComponentPropsWithRef<ToggleGroupItemProps>) => {
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cx("group", className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
};
GroupItem.displayName = "Toggle.GroupItem";

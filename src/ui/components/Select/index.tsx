"use client";
import * as SelectPrimitive from "@radix-ui/react-select";
import type { ComponentPropsWithRef, ForwardedRef, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { Icon } from "../Icon";
import { Hint, inputSharedStyles } from "../Input";
import { Label, type LabelProps } from "../Label";

export const Root = SelectPrimitive.Root;
export const Group = SelectPrimitive.Group;
export const Value = SelectPrimitive.Value;

export interface SelectTriggerProps
  extends ComponentPropsWithRef<typeof SelectPrimitive.Trigger> {
  invalid?: boolean;
}
export const Trigger = ({
  className,
  children,
  disabled,
  invalid,
  ref,
  ...props
}: SelectTriggerProps) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cx(
      inputSharedStyles,
      "flex justify-between items-center data-[state=open]:ring-itemSecondaryDefault group select-none",
      invalid && "!ring-backgroundErrorOnDefault",
      className,
    )}
    disabled={disabled}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <Icon
        iconKey="chevronDown"
        size={20}
        className="relative top-px transition-transform duration-[250] ease-in group-data-[state=open]:-rotate-180"
      />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);

export const ScrollUpButton = ({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof SelectPrimitive.ScrollUpButton>) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cx(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <Icon iconKey="chevronUp" className="opacity-50 size-4" />
  </SelectPrimitive.ScrollUpButton>
);

export const ScrollDownButton = ({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof SelectPrimitive.ScrollDownButton>) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cx(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <Icon iconKey="chevronDown" />
  </SelectPrimitive.ScrollDownButton>
);

export type ContentProps = typeof SelectPrimitive.Content;
export const Content = ({
  className,
  children,
  position = "popper",
  ref,
  ...props
}: ComponentPropsWithRef<ContentProps>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cx(
        "relative py-3 px-0 z-50 max-h-96 min-w-[8rem] overflow-hidden shadow-popover bg-backgroundPrimaryDefault",
        "data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <ScrollUpButton />
      <SelectPrimitive.Viewport
        className={cx(
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <ScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

export const Item = ({
  className,
  children,
  ref,
  ...props
}: ComponentPropsWithRef<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cx(
      inputSharedStyles,
      "border-0 ring-0 cursor-pointer hover:bg-backgroundPrimaryHighlight transition-colors flex items-center justify-between",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <span className="flex items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Icon iconKey="check" size={20} className="-my-1" />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
);

export const Separator = ({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cx("-mx-1 my-1 h-px bg-itemSecondaryMute", className)}
    {...props}
  />
);

export interface FieldProps extends SelectPrimitive.SelectProps {
  invalid?: boolean;
  hint?: string | ReactNode;
  label?: string | ReactNode;
  options: SelectPrimitive.SelectItemProps[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  contentProps?: SelectPrimitive.SelectContentProps;
  triggerProps?: SelectPrimitive.SelectTriggerProps;
  labelProps?: LabelProps;
  ref?: ForwardedRef<HTMLDivElement>;
}
export const Field = ({
  className,
  children,
  options,
  invalid,
  id,
  name,
  hint,
  label,
  disabled,
  placeholder,
  contentProps,
  triggerProps,
  labelProps,
  ref,
  ...props
}: FieldProps) => (
  <>
    <div className="relative flex-1 space-y-2 text-left" ref={ref}>
      {label && (
        <Label htmlFor={id ?? name} disabled={disabled} {...labelProps}>
          {label}
        </Label>
      )}
      <Root {...props}>
        <Trigger
          className="w-full"
          id={id}
          name={name}
          disabled={disabled}
          invalid={invalid}
          {...triggerProps}
        >
          <Value placeholder={placeholder} />
        </Trigger>
        <Content {...contentProps}>
          {options.map((item, i) => {
            return (
              <Item key={i} value={item.value} className={item.className}>
                {item.children}
              </Item>
            );
          })}
        </Content>
      </Root>
      {hint && <Hint invalid={invalid}>{hint}</Hint>}
    </div>
  </>
);

Trigger.displayName = "Select.Trigger";
Root.displayName = "Select.Root";
Group.displayName = "Select.Group";
Value.displayName = "Select.Value";
Content.displayName = "Select.Content";
Label.displayName = "Select.Label";
Item.displayName = "Select.Item";
Separator.displayName = "Select.Separator";
Field.displayName = "Select.Field";

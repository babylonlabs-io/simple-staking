import type * as T from "@radix-ui/react-select";
import * as SelectPrimitive from "@radix-ui/react-select";
import type { ForwardedRef } from "react";

import { cx } from "../../utils/cx";
import { Button } from "../Button";
import type { ButtonProps } from "../Button/types";
import { Icon } from "../Icon";

export type TriggerProps = {
  buttonProps?: ButtonProps;
  placeholder?: string;
} & T.SelectTriggerProps;

export type RootProps = {
  options: T.SelectItemProps[];
  separator?: boolean;
  triggerProps?: TriggerProps;
} & T.SelectProps;

export const Trigger = ({
  className,
  disabled,
  value,
  buttonProps,
  placeholder,
  children,
  ...props
}: TriggerProps) => {
  return (
    <SelectPrimitive.Trigger
      disabled={disabled}
      value={value}
      asChild
      {...props}
    >
      <Button
        size="sm"
        endIcon={{ iconKey: "chevronDown", className: "!size-[13px]" }}
        variant="text"
        disabled={disabled}
        className={cx(
          "m-0 flounder:m-0 w-fit py-[9px] px-[14px] flounder:py-[9px] flounder:px-[14px] !text-callout hover:no-underline",
          className,
        )}
        {...buttonProps}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {children}
        </SelectPrimitive.Value>
      </Button>
    </SelectPrimitive.Trigger>
  );
};

export const Root = ({ options, triggerProps, ...props }: RootProps) => {
  return (
    <SelectPrimitive.Root {...props}>
      <Trigger {...triggerProps} />
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="overflow-hidden z-1000" asChild>
          <div className="border border-itemSecondaryMute p-0 z-dialog bg-backgroundPrimaryDefault relative max-h-screen w-[240px] shadow-portal">
            <SelectPrimitive.Viewport>
              <SelectPrimitive.Group>
                {options.map((item, i) => {
                  return <Item key={i} {...item} />;
                })}
              </SelectPrimitive.Group>
            </SelectPrimitive.Viewport>
          </div>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

export interface ItemProps extends T.SelectItemProps {
  itemTextProps?: T.SelectItemTextProps;
  itemIndicatorProps?: T.SelectItemIndicatorProps;
  hideItemIndicator?: boolean;
  ref?: ForwardedRef<HTMLDivElement>;
}
export const Item = ({
  value,
  children,
  className,
  itemIndicatorProps,
  hideItemIndicator = false,
  ref,
  ...props
}: ItemProps) => {
  return (
    <SelectPrimitive.Item
      className={cx(
        "leading-[14px] relative p-[13px] flex items-center text-backgroundPrimaryOnDefault font-semibold cursor-pointer uppercase gap-2 text-mobileBody4 data-[disabled]:text-backgroundPrimaryOnMute data-[disabled]:pointer-events-none data-[highlighted]:bg-backgroundPrimaryActive data-[highlighted]:text-backgroundPrimaryOnActive focus-visible:outline-none",
        className,
      )}
      value={value}
      {...props}
      ref={ref}
    >
      <ItemText>{children}</ItemText>

      {!hideItemIndicator && (
        <ItemIndicator
          className="relative leading-0 -top-px"
          {...itemIndicatorProps}
        >
          <Icon iconKey="checkCircleFilled" size={12} />
        </ItemIndicator>
      )}
    </SelectPrimitive.Item>
  );
};

export const Value = SelectPrimitive.Value;
export const Viewport = SelectPrimitive.Viewport;
export const Portal = SelectPrimitive.Portal;
export const ItemText = SelectPrimitive.ItemText;
export const ItemIndicator = SelectPrimitive.ItemIndicator;

Trigger.displayName = "SelectDropdown.Trigger";
Root.displayName = "SelectDropdown.Root";
Value.displayName = "SelectDropdown.Value";
Viewport.displayName = "SelectDropdown.Viewport";
Portal.displayName = "SelectDropdown.Portal";
ItemText.displayName = "SelectDropdown.ItemText";
ItemIndicator.displayName = "SelectDropdown.ItemIndicator";

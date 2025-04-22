"use client";

import type * as T from "@radix-ui/react-accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import type { ForwardedRef } from "react";

import { cx } from "../../utils/cx";
import { Icon } from "../Icon";

const AccordionItem = ({
  children,
  value,
  className,
  ref,
  ...props
}: T.AccordionItemProps & { ref?: ForwardedRef<HTMLDivElement> }) => {
  return (
    <AccordionPrimitive.Item
      value={value}
      className={className}
      {...props}
      ref={ref}
    >
      {children}
    </AccordionPrimitive.Item>
  );
};

const AccordionTrigger = ({
  children,
  className,
  headerClassName,
  ref,
  ...props
}: T.AccordionTriggerProps & {
  headerClassName?: string;
  ref?: ForwardedRef<HTMLButtonElement>;
}) => {
  const triggerClassNames = cx("relative group", className);
  return (
    <Header className={headerClassName}>
      <AccordionPrimitive.Trigger
        className={triggerClassNames}
        {...props}
        ref={ref}
      >
        {children}
      </AccordionPrimitive.Trigger>
    </Header>
  );
};

const AccordionContent = ({
  children,
  className,
  ref,
  ...props
}: T.AccordionContentProps & { ref?: ForwardedRef<HTMLDivElement> }) => (
  <AccordionPrimitive.Content
    className={cx(
      "data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden",
      className,
    )}
    {...props}
    ref={ref}
  >
    {children}
  </AccordionPrimitive.Content>
);

export const Root = AccordionPrimitive.Root;
export const Item = AccordionItem;
export const Header = AccordionPrimitive.Header;
export const Trigger = AccordionTrigger;
export const Content = AccordionContent;

export type AccordionListItemProps = { header: string; content: string };
export type AccordionListProps = {
  list: AccordionListItemProps[];
  type?: "single" | "multiple";
};
export const AccordionList = ({
  list,
  type = "single",
  ...props
}: AccordionListProps) => {
  return (
    <Root
      type={type}
      collapsible
      className="space-y-4 *:ring-1 *:ring-itemSecondaryMute data-[state=open]:*:ring-itemSecondaryDefault *:transition-shadow hover:*:ring-itemSecondaryDefault"
    >
      {list.map(({ header, content }, i) => {
        return (
          <Item value={header as string} key={i}>
            <Trigger className="flex items-center justify-between w-full gap-3 p-4 font-sans font-semibold text-left text-body4 flounder:p-6 focus:outline-itemSecondaryDefault">
              <span>{header}</span>

              <div className="relative size-6 flounder:size-7">
                <Icon
                  size={24}
                  iconKey="plus"
                  className="absolute top-px left-0 transition-transform duration-[250ms] ease-in group-data-[state=open]:[transform:rotateX(90deg)] size-6 flounder:size-7"
                />
                <Icon
                  size={24}
                  iconKey="minus"
                  className="absolute top-px left-0 transition-opacity duration-[250ms] opacity-0 ease-in group-data-[state=open]:opacity-100 size-6 flounder:size-7"
                />
              </div>
            </Trigger>
            <Content {...props}>
              <div className="p-4 flounder:p-6 !pt-0 max-w-4xl text-itemSecondaryDefault">
                <p
                  className="text-body4 pr-11 text-withLink"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </Content>
          </Item>
        );
      })}
    </Root>
  );
};

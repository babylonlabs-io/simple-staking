import type * as T from "@radix-ui/react-dropdown-menu";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentPropsWithRef, ForwardedRef } from "react";

import { cx } from "../../utils/cx";
import * as Accordion from "../Accordion";
import { Icon } from "../Icon";
import { ListItem, type NavItemProps } from "../Nav";

export interface DropdownContentProps extends T.DropdownMenuContentProps {
  contentClassName?: string;
  list?: NavItemProps[];
  ref?: ForwardedRef<HTMLDivElement>;
}
export interface DropdownMenuTriggerProps extends T.DropdownMenuTriggerProps {}

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
export const Sub = DropdownPrimitive.Sub;
export const SubTrigger = DropdownPrimitive.SubTrigger;
export const SubContent = DropdownPrimitive.SubContent;
export const Separator = DropdownPrimitive.Separator;

export const Trigger = ({ children, ...props }: DropdownMenuTriggerProps) => (
  <DropdownPrimitive.Trigger asChild {...props}>
    {children}
  </DropdownPrimitive.Trigger>
);

export const Label = ({ children, ...props }: T.DropdownMenuLabelProps) => (
  <DropdownPrimitive.Label {...props}>{children}</DropdownPrimitive.Label>
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
    "bg-backgroundPrimaryDefault z-header",
    "fixed -right-4 w-screen t-0 overflow-auto",
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
        style={{ height: "calc(100vh - var(--mobileTopOffset))" }}
        {...props}
      >
        {list && (
          <Accordion.Root type="single" collapsible>
            {list.map((item, i) => {
              return item.url ? (
                <Item key={i} className="outline-none z-[2]" asChild>
                  <ListItem
                    as={item.as}
                    url={item.url}
                    title={item.title}
                    active={item.active}
                    className={cx(
                      listItemStyles,
                      item.active && "text-brandDefault",
                    )}
                  />
                </Item>
              ) : (
                <SubMenu title={item.title} submenu={item?.submenu} key={i} />
              );
            })}
          </Accordion.Root>
        )}
        {children}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  );
};

const SubMenu = ({ title, submenu }: NavItemProps) => {
  const triggerClassNames = cx(
    listItemStyles,
    "data-[state=open]:bg-backgroundPrimaryHighlightAlt",
  );

  return (
    <Accordion.Item value={title as string}>
      <Accordion.Trigger className={triggerClassNames}>
        <div className="absolute left-0 top-0 h-full border-l-8 border-transparent transition-colors group-data-[state=open]:border-backgroundBrandHighlight"></div>
        <span>{title}</span>

        <Icon
          size={20}
          iconKey="chevronDown"
          className="relative top-px transition-transform duration-[250] ease-in group-data-[state=open]:-rotate-180"
        />
      </Accordion.Trigger>
      <Accordion.Content>
        {submenu?.length ? (
          <div className="divide-y divide-itemPrimaryMute w-full will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade">
            {submenu.map((item, i) => {
              if (item?.separator) {
                return undefined;
              }
              return (
                <div key={i} className="bg-backgroundPrimaryHighlight">
                  <ListItem
                    as={item.as}
                    url={item.url}
                    title={item.title}
                    active={item.active}
                    badge={item.badge}
                    className={cx(
                      listItemStyles,
                      "!font-medium",
                      item.active
                        ? "text-itemPrimaryDefault dark:text-brandDefault !bg-backgroundPrimaryHighlightAlt"
                        : "text-itemPrimaryDefaultAlt1",
                    )}
                  >
                    {item?.children}
                  </ListItem>
                </div>
              );
            })}
          </div>
        ) : null}
      </Accordion.Content>
    </Accordion.Item>
  );
};

Root.displayName = "DropdownNav.Root";
Trigger.displayName = "DropdownNav.Trigger";
Trigger.displayName = "DropdownNav.Label";
Content.displayName = "DropdownNav.Content";

const listItemStyles =
  "flex w-full justify-between align-middle text-body3 font-semibold px-6 py-6 focus-visible:-outline-offset-1 focus-visible:outline-brandDefault focus-visible:outline-1";

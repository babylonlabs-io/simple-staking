import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import type { ElementType, PropsWithChildren, ReactNode } from "react";

import { cx } from "../../utils";
import { Icon, type IconProps } from "../Icon";
import { Separator } from "../Separator";

type Link = {
  title?: string;
  url?: string;
  className?: string;
  active?: boolean;
  as?: ElementType | string;
};

interface SubmenuItemProps extends Link {
  separator?: boolean;
  hide?: boolean;
  badge?: ReactNode;
  activeIconProps?: IconProps;
}

export interface NavItemProps extends Link {
  submenu?: PropsWithChildren<SubmenuItemProps>[];
}

export interface NavProps {
  list: NavItemProps[];
  className?: string;
  dark?: boolean;
}

export const navItemStyles =
  "flex group select-none items-center justify-between gap-1 px-2 py-2 text-[14px] font-medium no-underline outline-none salmon:px-3 font-mono font-semibold";

export const listItemStyles =
  "flex justify-between align-middle text-[14px] px-4 py-3.5 hover:bg-backgroundSecondaryDefault transition-colors font-mono font-semibold";

export const Nav = ({ className, list, dark }: NavProps) => {
  return (
    <div className={className}>
      <NavigationMenu.Root
        className="relative z-[1] flex justify-center"
        aria-label="Nav"
        delayDuration={0}
      >
        <NavigationMenu.List className="flex gap-0 py-0 m-0 -mt-px list-none center salmon:gap-5">
          {list.map((item, i) => {
            const Element = item.as ?? "a";
            return (
              <NavigationMenu.Item key={i} className="relative">
                {item.url ? (
                  <NavigationMenu.Link
                    className={navItemStyles}
                    asChild
                    href={item.url}
                  >
                    <Element>{item.title}</Element>
                  </NavigationMenu.Link>
                ) : (
                  <NavigationMenu.Trigger className={navItemStyles}>
                    <span>{item.title}</span>
                  </NavigationMenu.Trigger>
                )}

                {item.submenu?.length ? (
                  <NavigationMenu.Content
                    className={cx(
                      "data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut bg-backgroundPrimaryDefault dark:ring-1 dark:ring-inset dark:ring-itemPrimaryMute top-[calc(100%+6px)] dark:top-[calc(100%+6px)] flex justify-center absolute -left-2 w-full flounder:w-auto",
                      dark &&
                        "bg-transparent ring-1 !ring-inset !ring-neutral90/20 !top-[calc(100%+6px)] backdrop-blur-[20px]",
                    )}
                  >
                    <ul className="border-l-8 border-backgroundBrandHighlight m-0 grid list-none flounder:w-[320px] py-3 shadow-portal">
                      {item.submenu.map((listItem, j) => {
                        if (listItem.separator) {
                          return (
                            <Separator
                              key={j}
                              className={cx("my-3", dark && "bg-neutral90/20")}
                            />
                          );
                        }
                        return (
                          <li key={j}>
                            <NavigationMenu.Link asChild>
                              <ListItem
                                as={listItem.as}
                                url={listItem.url}
                                title={listItem.title}
                                active={listItem.active}
                                badge={listItem.badge}
                                className={cx(
                                  listItemStyles,
                                  dark &&
                                    "text-neutral100 hover:bg-neutral90/20",
                                )}
                              >
                                {listItem.children}
                              </ListItem>
                            </NavigationMenu.Link>
                          </li>
                        );
                      })}
                    </ul>
                  </NavigationMenu.Content>
                ) : null}
              </NavigationMenu.Item>
            );
          })}
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </div>
  );
};

export const ListItem = ({
  className,
  children,
  url,
  active,
  title,
  as,
  badge,
  activeIconProps,
  ...props
}: PropsWithChildren<SubmenuItemProps>) => {
  const Element = as ?? "a";
  return (
    <Element className={className ?? listItemStyles} href={url} {...props}>
      <div className="flex items-center gap-2">
        {children && <div className="w-5">{children}</div>}
        <span>{title}</span>
      </div>

      {(badge || active) && (
        <div className="flex items-center gap-1">
          {badge ?? null}
          {active && (
            <Icon
              size={20}
              iconKey="check"
              className="relative top-px transition-transform duration-[250] ease-in group-data-[state=open]:-rotate-180"
              {...activeIconProps}
            />
          )}
        </div>
      )}
    </Element>
  );
};

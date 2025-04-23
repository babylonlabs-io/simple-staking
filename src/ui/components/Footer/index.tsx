import { cx } from "../../utils/cx";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Logo } from "../Logo";
import type { NavItemProps } from "../Nav";
import type { SocialLinkProps } from "../SocialCard";

export type PageLinkProps = {
  url: string;
  title: string;
};

export interface FooterProps {
  currentYear?: string | number;
  socials?: SocialLinkProps[];
  fixed?: boolean;
  links?: PageLinkProps[];
  className?: string;
  title?: string;
  menu?: NavItemProps[];
  isMd?: boolean;
  simple?: boolean;
}

export const Footer = ({
  currentYear,
  socials,
  fixed,
  links,
  title,
  menu,
  className,
  isMd,
  simple,
}: FooterProps) => {
  const classNames = cx(
    "py-11 flounder:py-12 bg-neutral0 text-neutral100",
    fixed && "fixed w-full inset-x-0 bottom-0",
    simple &&
      "isolate bg-backgroundPrimaryDefault text-backgroundPrimaryOnDefault border-t border-itemPrimaryMute py-1 flounder:py-2",
    className,
  );

  if (simple) {
    return (
      <footer className={classNames} id="footer" aria-labelledby="footer">
        <div className="px-4">
          <div className="flex items-center justify-between text-">
            <div className="flex items-center gap-6">
              <Copyright
                currentYear={currentYear}
                className="font-semibold text-callout text-itemPrimaryDefault"
              />

              {links && isMd && (
                <div className="flex flex-wrap items-center gap-4 mt-0 gap-y-1 flounder:gap-3 flounder:gap-y-1">
                  {links.map((item) => (
                    <Button
                      key={item.title}
                      href={item.url}
                      variant="text"
                      size="sm"
                      className="normal-case flounder:!text-callout underline underline-offset-1 hover:no-underline font-normal"
                    >
                      {item.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {socials && (
              <Socials
                list={socials}
                className="gap-0 flounder:gap-1"
                iconClassName="size-4"
              />
            )}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={classNames} id="footer" aria-labelledby="footer">
      <div className="px-4 flounder:px-12">
        <div className="flex flex-wrap mb-16 flounder:flex-nowrap salmon:mb-17">
          <div className="w-[240px] flounder:w-7/12 salmon:w-1/2">
            {!isMd && <Logotype />}
            {title && (
              <h3
                className="max-w-md text-h3"
                dangerouslySetInnerHTML={{ __html: title }}
              />
            )}
          </div>
          {isMd && (
            <div className="w-full salmon:w-1/2">
              {socials && <Socials list={socials} />}
            </div>
          )}
        </div>

        <div className="flex flex-wrap salmon:flex-nowrap salmon:items-end salmon:flex-row-reverse salmon:pt-2 whale:justify-between">
          <div className="w-full salmon:w-8/12 whale:w-7/12 whale:max-w-[808px]">
            <div className="grid grid-cols-2 flounder:grid-cols-4 gap-9 flounder:gap-8">
              {menu &&
                menu.map((item) => (
                  <div key={item.title}>
                    <h6 className="font-semibold leading-6 tracking-wider uppercase text-neutral50 text-desktopCallout">
                      {item.title}
                    </h6>
                    {item?.submenu && (
                      <ul className="mt-3 flounder:mt-4 space-y-2.5">
                        {item.submenu.map((listItem) => {
                          if (listItem.hide || listItem.separator) {
                            return undefined;
                          }
                          return (
                            <li key={listItem.title}>
                              <Button
                                href={listItem.url}
                                variant="text"
                                size="sm"
                                className="!font-normal normal-case !font-desktopCallout"
                              >
                                <div className="flex items-start gap-2">
                                  <span>{listItem.title}</span>

                                  {listItem.badge && (
                                    <span className="rounded ring-1 ring-brandDefault text-brandDefault text-tag2 px-[4px] py-[2px] relative top-px whitespace-nowrap">
                                      {listItem.badge}
                                    </span>
                                  )}
                                </div>
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </div>
          <div className="w-full mt-15 salmon:mt-0 salmon:w-4/12 whale:w-5/12">
            {isMd && <Logotype />}

            <div className="flex flex-wrap items-center mt-0 salmon:mt-5 flounder:gap-5">
              {isMd && currentYear && (
                <div className="[@media(min-width:1744px)]:border-r whale:border-neutral30 flounder:pr-5">
                  <Copyright currentYear={currentYear} />
                </div>
              )}
              {links && (
                <div className="flex flex-wrap items-center gap-4 mt-0 gap-y-1 flounder:gap-5 flounder:gap-y-1">
                  {links.map((item) => (
                    <div
                      key={item.title}
                      className="pr-4 border-r flounder:pr-5 border-neutral30 last:border-0"
                    >
                      <Button
                        href={item.url}
                        variant="text"
                        size="sm"
                        className="!font-normal normal-case !font-desktopCallout"
                      >
                        {item.title}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!isMd && currentYear && (
              <div className="mt-3">
                <Copyright currentYear={currentYear} />
              </div>
            )}
          </div>
        </div>
        {!isMd && (
          <div className="w-full mt-7">
            {socials && <Socials list={socials} />}
          </div>
        )}
      </div>
    </footer>
  );
};

const Copyright = ({
  currentYear,
  className,
}: {
  currentYear?: string | number;
  className?: string;
}) => (
  <span
    className={cx(
      "font-semibold text-desktopCallout text-neutral50 whitespace-nowrap",
      className,
    )}
  >
    &copy; {currentYear} stakefish
  </span>
);

const Logotype = () => (
  <div className="text-[0px] mb-4 salmon:mb-0">
    <a href="/">
      <Logo className="salmon:w-[224px]" />
    </a>
  </div>
);

const Socials = ({
  list,
  className,
  iconClassName,
}: {
  list: SocialLinkProps[];
  className?: string;
  iconClassName?: string;
}) => (
  <div
    className={cx("flex gap-2 flounder:gap-4 salmon:justify-end", className)}
  >
    {list.map(({ url, icon }, i: number) => (
      <a
        key={i}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-2 transition-colors hover:text-brandDefault clear-inline-indents"
      >
        <Icon iconKey={icon} className={iconClassName} />
      </a>
    ))}
  </div>
);

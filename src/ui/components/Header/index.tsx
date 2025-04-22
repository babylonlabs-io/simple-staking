import type { ElementType, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { Logo } from "../Logo";

export interface HeaderProps {
  filled?: boolean;
  bordered?: boolean;
  pictogramOnly?: boolean;
  monochromeLogo?: boolean;
  fixed?: boolean;
  logoUrl?: string;
  actionsContent?: ReactNode;
  frontMenu?: ReactNode;
  centerMenu?: ReactNode;
  className?: string;
  ElementLogo?: ElementType;
  variant?: "dark";
}

export const Header = ({
  filled,
  bordered,
  pictogramOnly = false,
  fixed = true,
  monochromeLogo,
  logoUrl = "/",
  ElementLogo = "a",
  actionsContent,
  frontMenu,
  centerMenu,
  className,
  variant,
}: HeaderProps) => {
  const forcedDarkMode = variant === "dark";
  const classNames = cx(
    "py-[10px] flounder:pt-0 flounder:pb-px z-header pointer-events-auto transition-colors flounder:h-[48px] flex",
    fixed ? "fixed inset-x-0 top-0" : "relative",
    filled && "bg-backgroundPrimaryDefault",
    bordered
      ? "after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-itemSecondaryMute"
      : "after:border-transparent",
    forcedDarkMode &&
      "after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-neutral90/20",
    bordered && forcedDarkMode && "after:border-itemSecondaryMute",
    className,
  );

  return (
    <>
      <ElementLogo
        href={logoUrl}
        className={cx(
          fixed ? "fixed" : "absolute",
          "z-logo flex h-[48px] top-0 flounder:-left-px items-center px-4 text-itemPrimaryDefault",
          forcedDarkMode && !filled && "text-neutral100",
        )}
      >
        <Logo pictogramOnly={pictogramOnly} monochrome={monochromeLogo} />
      </ElementLogo>
      <header className={classNames} id="header" aria-labelledby="header">
        <div className="flex items-center justify-between w-full px-4">
          <div
            className={cx(
              "flex flounder:flex-1",
              forcedDarkMode && !filled && "text-neutral100",
            )}
          >
            <FrontContent
              ElementLogo={ElementLogo}
              logoUrl={logoUrl}
              pictogramOnly={pictogramOnly}
              frontMenu={frontMenu}
            />
          </div>
          <div className={cx("hidden flounder:flex flounder:gap-x-12")}>
            {centerMenu}
          </div>
          <div className="flex flounder:flex-1 flounder:justify-end">
            {actionsContent}
          </div>
        </div>
      </header>
    </>
  );
};

const FrontContent = ({
  frontMenu,
  pictogramOnly,
}: Pick<
  HeaderProps,
  "logoUrl" | "pictogramOnly" | "frontMenu" | "ElementLogo"
>) => {
  return (
    <div className="flex items-center gap-4">
      {/* logo width filler */}
      <div
        className={cx(
          "p-3 h-full ",
          pictogramOnly ? "w-[40px]" : "w-[54px] flounder:w-[112px]",
        )}
      />
      {frontMenu}
    </div>
  );
};

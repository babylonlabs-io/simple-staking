import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { twJoin } from "tailwind-merge";

import cogIcon from "@/ui/common/assets/cog.svg";

interface SettingMenuButtonProps extends HTMLAttributes<HTMLButtonElement> {
  toggleMenu: () => void;
}
export const SettingMenuButton = forwardRef<
  HTMLButtonElement,
  SettingMenuButtonProps
>(({ className, toggleMenu, ...props }, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      onClick={(e) => {
        toggleMenu();
        props.onClick?.(e);
      }}
      className={twJoin(
        "flex items-center justify-center w-10 h-10 p-1 border-secondary-contrast text-secondary-contrast",
        className,
      )}
    >
      <img src={cogIcon} alt="Settings" className="w-8 h-8" />
    </button>
  );
});

SettingMenuButton.displayName = "SettingMenuButton";

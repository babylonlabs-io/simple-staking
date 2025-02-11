import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

type MenuButtonProps = HTMLAttributes<HTMLButtonElement> & {
  isOpen: boolean;
  toggleMenu: () => void;
};

export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ className, isOpen, toggleMenu, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        onClick={(e) => {
          toggleMenu();
          props.onClick?.(e);
        }}
        className={`flex items-center justify-center p-2 border rounded border-secondary-contrast text-secondary-contrast ${className}`}
      >
        <MdKeyboardArrowDown
          size={24}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    );
  },
);

MenuButton.displayName = "MenuButton";

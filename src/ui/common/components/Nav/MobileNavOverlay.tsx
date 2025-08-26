import { MdClose } from "react-icons/md";
import { NavLink } from "react-router";
import { twJoin } from "tailwind-merge";

import { MobileLogo } from "../Logo/MobileLogo";

interface MobileNavOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const MobileNavOverlay = ({ open, onClose }: MobileNavOverlayProps) => {
  if (!open) return null;

  return (
    <div className="fixed flex flex-col inset-0 z-50 bg-surface">
      <div className="container h-20 flex items-center px-4 mx-auto sm:px-0 gap-4">
        <MobileLogo />
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="cursor-pointer text-accent-primary"
        >
          <MdClose size={32} />
        </button>
      </div>

      <nav className="container flex flex-col gap-9 px-4 sm:px-0 m-auto pb-20">
        <NavLink
          to="/btc"
          onClick={onClose}
          className={({ isActive }) =>
            twJoin(
              "text-2xl",
              isActive ? "text-accent-primary" : "text-accent-secondary",
            )
          }
        >
          BTC Staking
        </NavLink>

        <NavLink
          to="/baby"
          onClick={onClose}
          className={({ isActive }) =>
            twJoin(
              "text-2xl",
              isActive ? "text-accent-primary" : "text-accent-secondary",
            )
          }
        >
          BABY Staking
        </NavLink>
      </nav>
    </div>
  );
};

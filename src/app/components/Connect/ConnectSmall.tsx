import { useRef, useState } from "react";
import { PiWalletBold } from "react-icons/pi";
import { FaBitcoin } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useOnClickOutside } from "usehooks-ts";

import { trim } from "@/utils/trim";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { Hash } from "../Hash/Hash";

interface ConnectSmallProps {
  onConnect: () => void;
  address: string;
  balance: number;
  onDisconnect: () => void;
}

export const ConnectSmall: React.FC<ConnectSmallProps> = ({
  onConnect,
  address,
  balance,
  onDisconnect,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const handleClickOutside = () => {
    setShowMenu(false);
  };

  const ref = useRef(null);
  useOnClickOutside(ref, handleClickOutside);

  return address ? (
    <div className="relative mr-[-10px] flex text-sm">
      <button
        className="flex cursor-pointer"
        onClick={() => setShowMenu(!showMenu)}
      >
        <div className="rounded-lg border border-base-200/75 p-2 pr-4">
          <div className="flex items-center gap-1">
            <FaBitcoin className="text-primary" />
            <p>
              <strong>{+(balance / 1e8).toFixed(6) || 0} BTC</strong>
            </p>
          </div>
        </div>
        <div className="relative right-[10px] rounded-lg border border-primary bg-[#fdf2ec] p-2 dark:border-white dark:bg-base-200">
          {trim(address)}
        </div>
      </button>
      {showMenu && (
        <div
          className="absolute right-[10px] top-0 z-10 mt-[4.5rem] flex flex-col gap-4 rounded-lg bg-base-300 p-4 shadow-lg dark:bg-base-200"
          style={{
            // margin - border
            width: "calc(100% - 8px)",
          }}
          ref={ref}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold dark:text-neutral-content">Settings</h3>
            <button
              className="btn btn-circle btn-ghost btn-sm"
              onClick={() => setShowMenu(false)}
            >
              <IoMdClose size={24} />
            </button>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-xs">
              <p>Light/Dark mode</p>
              <ThemeToggle />
            </div>
            <div className="divider my-0" />
            <Hash value={address} address noFade fullWidth />
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setShowMenu(false);
              onDisconnect();
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  ) : (
    <button
      className="btn-primary btn h-[2.5rem] min-h-[2.5rem] rounded-full px-2 text-white md:rounded-lg"
      onClick={onConnect}
      disabled={!!address}
    >
      <PiWalletBold size={20} className="flex md:hidden" />
      <span className="hidden md:flex">Connect to BTC signet network</span>
    </button>
  );
};

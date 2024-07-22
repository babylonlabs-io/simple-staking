import { useRef, useState } from "react";
import { FaBitcoin } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { PiWalletBold } from "react-icons/pi";
import { useOnClickOutside } from "usehooks-ts";

import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";
import { trim } from "@/utils/trim";

import { Hash } from "../Hash/Hash";

interface ConnectSmallProps {
  onConnect: () => void;
  address: string;
  balanceSat: number;
  onDisconnect: () => void;
}

export const ConnectSmall: React.FC<ConnectSmallProps> = ({
  onConnect,
  address,
  balanceSat,
  onDisconnect,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const handleClickOutside = () => {
    setShowMenu(false);
  };

  const ref = useRef(null);
  useOnClickOutside(ref, handleClickOutside);

  const { coinName, networkName } = getNetworkConfig();

  return address ? (
    <div className="relative mr-[-10px] text-sm hidden md:flex" ref={ref}>
      <button
        className="flex cursor-pointer outline-none items-stretch"
        onClick={() => setShowMenu(!showMenu)}
      >
        <div className="flex items-center rounded-lg border border-base-200/75 p-2 pr-4">
          <div className="flex items-center gap-1">
            <FaBitcoin className="text-primary" />
            <p>
              <strong>
                {maxDecimals(satoshiToBtc(balanceSat), 8) || 0} {coinName}
              </strong>
            </p>
          </div>
        </div>
        <div className="relative right-[10px] flex items-center rounded-lg border border-primary bg-[#fdf2ec] p-2 dark:border-white dark:bg-base-200">
          {trim(address)}
        </div>
      </button>
      {showMenu && (
        <div
          className="absolute right-[10px] top-0 z-10 mt-[4.5rem] flex flex-col gap-4 rounded-lg bg-base-300 p-4 shadow-lg"
          style={{
            // margin - border
            width: "calc(100% - 8px)",
          }}
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
      <span className="hidden md:flex">Connect to {networkName} network</span>
    </button>
  );
};

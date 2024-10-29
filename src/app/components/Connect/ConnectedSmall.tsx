import { useRef, useState } from "react";
import { FaBitcoin } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useOnClickOutside } from "usehooks-ts";

import { useAppState } from "@/app/state";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";
import { trim } from "@/utils/trim";

import { Hash } from "../Hash/Hash";
import { LoadingSmall } from "../Loading/Loading";

interface ConnectedSmallProps {
  loading?: boolean;
  address: string;
  onDisconnect: () => void;
  btcWalletBalanceSat?: number;
}

export const ConnectedSmall: React.FC<ConnectedSmallProps> = ({
  loading = false,
  address,
  btcWalletBalanceSat,
  onDisconnect,
}) => {
  const { ordinalsExcluded, includeOrdinals, excludeOrdinals } = useAppState();

  const [showMenu, setShowMenu] = useState(false);
  const handleClickOutside = () => {
    setShowMenu(false);
  };

  const ref = useRef(null);
  useOnClickOutside(ref, handleClickOutside);

  const { coinName } = getNetworkConfig();

  return (
    address && (
      <div className="relative flex text-sm" ref={ref}>
        <button
          className="flex cursor-pointer outline-none items-stretch w-full justify-between"
          onClick={() => setShowMenu(!showMenu)}
        >
          <div className="flex items-center rounded-lg border border-base-200/75 p-2 pr-4 w-full">
            <div className="flex items-center gap-1 w-full justify-center">
              <FaBitcoin className="text-primary" />
              {typeof btcWalletBalanceSat === "number" && (
                <p>
                  <strong>
                    {maxDecimals(satoshiToBtc(btcWalletBalanceSat), 8)}{" "}
                    {coinName}
                  </strong>
                </p>
              )}
              {loading && <LoadingSmall text="Loading..." />}
            </div>
          </div>
          <div className="relative flex items-center rounded-lg border border-primary bg-[#fdf2ec] p-2 dark:border-white dark:bg-base-200">
            {trim(address)}
          </div>
        </button>
        {showMenu && (
          <div className="absolute top-0 z-10 mt-[4.5rem] flex flex-col gap-4 rounded-lg bg-base-300 p-4 shadow-lg w-full">
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
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Ordinals included</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={!ordinalsExcluded}
                  onChange={
                    ordinalsExcluded ? includeOrdinals : excludeOrdinals
                  }
                />
              </label>
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
    )
  );
};

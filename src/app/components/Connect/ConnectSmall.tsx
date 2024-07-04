import { useRef, useState } from "react";
import { FaArrowCircleRight } from "react-icons/fa";
import { PiWalletBold } from "react-icons/pi";
import { useOnClickOutside } from "usehooks-ts";

import { getNetworkConfig } from "@/config/network.config";
import { trim } from "@/utils/trim";

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
    <div className="relative mr-[-10px] flex text-sm">
      <button className="flex cursor-pointer outline-none">
        <div className="relative right-[10px] border uppercase text-es-text-secondary border-[#5b5b5b] bg-transparent text-sm md:text-base p-2 flex items-center justify-between min-w-[120px] md:min-w-[180px]">
          <span onClick={onConnect} className="hover:text-es-accent">
            {trim(address)}
          </span>
          <FaArrowCircleRight
            fill="#b2b2b2"
            onClick={() => {
              onDisconnect();
            }}
          />
        </div>
      </button>
    </div>
  ) : (
    <button className="primary-button" onClick={onConnect} disabled={!!address}>
      <PiWalletBold size={20} className="flex md:hidden" />
      <span className="hidden md:flex uppercase text-black font-medium text-lg">
        Stake now
      </span>
    </button>
  );
};

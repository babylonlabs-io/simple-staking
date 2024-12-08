import { Button, Text } from "@babylonlabs-io/bbn-core-ui";
import Image from "next/image";
import { useRef, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { MdKeyboardArrowDown } from "react-icons/md";
import { PiWalletBold } from "react-icons/pi";
import { Tooltip } from "react-tooltip";
import { useOnClickOutside } from "usehooks-ts";

import keplr from "@/app/assets/Keplr.png";
import okx from "@/app/assets/OKX.png";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { useAppState } from "@/app/state";
import { getNetworkConfig } from "@/config/network.config";

import { Menu } from "./Menu";

interface ConnectSmallProps {
  loading?: boolean;
  onConnect: () => void;
  address: string;
  connected: boolean;
  btcWalletBalanceSat?: number;
  onDisconnect: () => void;
}

export const ConnectSmall: React.FC<ConnectSmallProps> = ({
  loading = false,
  connected,
  onConnect,
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
  const { isApiNormal, isGeoBlocked, apiMessage } = useHealthCheck();

  // Renders the Tooltip describing the reason
  // why the user might not be able to connect the wallet
  const renderApiNotAvailableTooltip = () => {
    if (!isGeoBlocked && isApiNormal) return null;

    return (
      <>
        <span
          className="cursor-pointer text-xs"
          data-tooltip-id="tooltip-connect"
          data-tooltip-content={apiMessage}
          data-tooltip-place="bottom"
        >
          <AiOutlineInfoCircle />
        </span>
        <Tooltip id="tooltip-connect" className="tooltip-wrap" />
      </>
    );
  };

  if (!connected) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="large"
          color="secondary"
          className="h-[2.5rem] min-h-[2.5rem] rounded-full px-6 py-2 text-white text-base md:rounded-lg"
          onClick={onConnect}
          // Disable the button if the user is already connected
          // or: API is not available, geo-blocked, or has an error
          disabled={connected || !isApiNormal}
        >
          <PiWalletBold size={20} className="flex md:hidden" />
          <span className="hidden md:flex">Connect Wallets</span>
        </Button>
        {!isApiNormal && renderApiNotAvailableTooltip()}
      </div>
    );
  }

  return (
    <div className="relative flex flex-row gap-4">
      <div className="flex flex-row">
        <Image src={okx} alt="OKX" width={40} height={40} />
        <Image
          src={keplr}
          alt="Keplr"
          width={40}
          height={40}
          className="-ml-3"
        />
      </div>
      <div className="flex flex-col text-secondary-contrast">
        <Text variant="body1">Wallet Connected</Text>
        <div className="flex flex-row text-sm gap-2">
          <Text variant="body1">bc1pnT</Text>
          <Text variant="body1">|</Text>
          <Text variant="body1">bbn170</Text>
        </div>
      </div>
      <div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center justify-center p-2 border rounded border-secondary-contrast text-secondary-contrast"
        >
          <MdKeyboardArrowDown size={24} />
        </button>
      </div>
      <Menu open={showMenu} onClose={() => setShowMenu(false)} />
    </div>
  );
};

import {
  Avatar,
  AvatarGroup,
  Button,
  Popover,
  Text,
} from "@babylonlabs-io/bbn-core-ui";
import { useWalletConnect } from "@babylonlabs-io/bbn-wallet-connect";
import Image from "next/image";
import { useRef, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { MdKeyboardArrowDown } from "react-icons/md";
import { PiWalletBold } from "react-icons/pi";
import { Tooltip } from "react-tooltip";
import { useResizeObserver } from "usehooks-ts";

import bitcoin from "@/app/assets/bitcoin.png";
import bbnIcon from "@/app/assets/icon-black.svg";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { useAppState } from "@/app/state";

import { Hash } from "../Hash/Hash";
import { Toggle } from "../Toggle/Toggle";

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
  const anchorEl = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver({
    ref: anchorEl,
    box: "border-box",
  });
  const { ordinalsExcluded, includeOrdinals, excludeOrdinals } = useAppState();
  const { disconnect } = useWalletConnect();

  const [showMenu, setShowMenu] = useState(false);
  const handleClickOutside = () => {
    setShowMenu(false);
  };

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
    <div ref={anchorEl} className="relative flex flex-row gap-4">
      <div className="flex flex-row">
        <AvatarGroup max={2} variant="circular">
          <Avatar alt="OKX" url="/OKX.png" />
          <Avatar alt="Keplr" url="/Keplr.png" />
        </AvatarGroup>
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
      <Popover
        anchorEl={anchorEl.current}
        open={showMenu}
        onClickOutside={handleClickOutside}
        className="flex flex-col gap-4 bg-secondary-contrast rounded p-4 border border-primary-light/20"
        style={{ width }}
      >
        <div className="flex flex-row gap-4">
          <Image src={bitcoin} alt="bitcoin" width={40} height={40} />
          <div className="flex flex-col">
            <Text variant="body1" className="text-primary-dark text-base">
              Bitcoin
            </Text>
            <Hash value={address} address noFade fullWidth />
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Text variant="body2" className="text-sm text-primary-dark">
            Not using Inscriptions
          </Text>
          <div>
            <Toggle disabled={true} />
          </div>
        </div>
        <div className="divider" />
        <div className="flex flex-row gap-4">
          <Image src={bbnIcon} alt="bitcoin" width={40} height={40} />
          <div className="flex flex-col">
            <Text variant="body1" className="text-primary-dark text-base">
              Babylon Chain
            </Text>
            <Hash value={address} address noFade fullWidth />
          </div>
        </div>
        <div className="divider" />
        <div className="flex items-center justify-start">
          <button
            className="text-sm text-secondary-main"
            onClick={() => {
              setShowMenu(false);
              disconnect();
            }}
          >
            Disconnect Wallets
          </button>
        </div>
      </Popover>
    </div>
  );
};

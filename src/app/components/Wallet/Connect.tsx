import {
  Avatar,
  AvatarGroup,
  Button,
  MobileDialog,
  Popover,
  Text,
} from "@babylonlabs-io/bbn-core-ui";
import {
  useWalletConnect,
  useWidgetState,
} from "@babylonlabs-io/bbn-wallet-connect";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { MdKeyboardArrowDown } from "react-icons/md";
import { PiWalletBold } from "react-icons/pi";
import { Tooltip } from "react-tooltip";

import bitcoin from "@/app/assets/bitcoin.png";
import bbnIcon from "@/app/assets/icon-black.svg";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useIsMobileView } from "@/app/hooks/useBreakpoint";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { useAppState } from "@/app/state";

import { Hash } from "../Hash/Hash";
import { WalletDisconnectModal } from "../Modals/WalletDisconnectModal";
import { Toggle } from "../Toggle/Toggle";

interface ConnectProps {
  loading?: boolean;
  onConnect: () => void;
}

export const Connect: React.FC<ConnectProps> = ({
  loading = false,
  onConnect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobileView = useIsMobileView();
  const { includeOrdinals, excludeOrdinals, ordinalsExcluded } = useAppState();

  // Wallet states
  const { address: btcAddress, connected: btcConnected } = useBTCWallet();
  const { bech32Address, connected: bbnConnected } = useCosmosWallet();
  const { disconnect } = useWalletConnect();

  // Widget states
  const { selectedWallets } = useWidgetState();

  const [showMenu, setShowMenu] = useState(false);
  const { isApiNormal, isGeoBlocked, apiMessage } = useHealthCheck();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const isConnected = useMemo(
    () => btcConnected && bbnConnected,
    [btcConnected, bbnConnected],
  );

  const handleClickOutside = useCallback(() => {
    setShowMenu(false);
  }, []);

  const handleDisconnectClick = useCallback(() => {
    setShowMenu(false);
    setShowDisconnectModal(true);
  }, []);

  const handleDisconnectCancel = useCallback(() => {
    setShowDisconnectModal(false);
    setShowMenu(true);
  }, []);

  const handleDisconnectConfirm = useCallback(() => {
    setShowDisconnectModal(false);
    disconnect();
  }, [disconnect]);

  const renderApiNotAvailableTooltip = useMemo(() => {
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
  }, [isGeoBlocked, isApiNormal, apiMessage]);

  if (!isConnected) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="large"
          color="secondary"
          className="h-[2.5rem] min-h-[2.5rem] rounded-full px-6 py-2 text-white text-base md:rounded-lg"
          onClick={onConnect}
          disabled={isConnected || !isApiNormal || loading}
        >
          <PiWalletBold size={20} className="flex md:hidden" />
          <span className="hidden md:flex">Connect Wallets</span>
        </Button>
        {!isApiNormal && renderApiNotAvailableTooltip}
      </div>
    );
  }

  const walletContent = (
    <div className="flex flex-col gap-2 w-full min-w-[250px]">
      <div className="flex flex-row gap-2 mb-2">
        <div className="flex items-center justify-center">
          <Image
            src={bitcoin}
            alt="bitcoin"
            className="max-w-[40px] max-h-[40px]"
          />
        </div>
        <div className="flex flex-col">
          <Text variant="body1" className="text-primary-main text-base">
            Bitcoin
          </Text>
          <Hash value={btcAddress} address noFade fullWidth symbols={12} />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <Text variant="body2" className="text-sm text-primary-main">
          {ordinalsExcluded ? "Not using Inscriptions" : "Using Inscriptions"}
        </Text>
        <div className="flex flex-col items-center justify-center">
          <Toggle
            defaultChecked={ordinalsExcluded}
            onChange={() => {
              ordinalsExcluded ? includeOrdinals() : excludeOrdinals();
            }}
          />
        </div>
      </div>
      <div className="divider my-0" />
      <div className="flex flex-row gap-2">
        <div className="flex items-center justify-center">
          <Image src={bbnIcon} alt="babylon" width={40} height={40} />
        </div>
        <div className="flex flex-col">
          <Text variant="body1" className="text-primary-dark text-base">
            Babylon Chain
          </Text>
          <Hash value={bech32Address} address noFade fullWidth symbols={12} />
        </div>
      </div>
      <div className="divider my-0" />
      <div
        className="flex items-center justify-start text-secondary-main cursor-pointer transition-colors w-full py-2"
        onClick={handleDisconnectClick}
      >
        <button className="text-sm w-full text-left">Disconnect Wallets</button>
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={containerRef}
        className="relative flex flex-row items-center gap-2"
      >
        <div className="flex flex-row">
          <AvatarGroup max={2} variant="circular">
            <Avatar
              alt={selectedWallets["BTC"]?.name}
              url={selectedWallets["BTC"]?.icon}
              size="medium"
              className="object-contain bg-white"
            />
            <Avatar
              alt={selectedWallets["BBN"]?.name}
              url={selectedWallets["BBN"]?.icon}
              size="medium"
              className="object-contain bg-white"
            />
          </AvatarGroup>
        </div>
        <div className="hidden md:flex flex-col text-secondary-contrast">
          <Text variant="body1">Wallet Connected</Text>
          <div className="flex flex-row text-sm gap-2">
            <Text variant="body1">{btcAddress.slice(0, 6)}</Text>
            <Text variant="body1">|</Text>
            <Text variant="body1">{bech32Address.slice(0, 6)}</Text>
          </div>
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center justify-center p-2 border rounded border-secondary-contrast text-secondary-contrast"
        >
          <MdKeyboardArrowDown size={24} />
        </button>

        {isMobileView ? (
          <MobileDialog
            open={showMenu}
            onClose={handleClickOutside}
            className="p-4"
          >
            {walletContent}
          </MobileDialog>
        ) : (
          <Popover
            anchorEl={containerRef.current}
            open={showMenu}
            offset={[0, 11]}
            placement="bottom-end"
            onClickOutside={handleClickOutside}
            className="flex flex-col gap-2 bg-secondary-contrast rounded p-4 border border-primary-light/20"
          >
            {walletContent}
          </Popover>
        )}
      </div>

      <WalletDisconnectModal
        isOpen={showDisconnectModal}
        onClose={handleDisconnectCancel}
        onDisconnect={handleDisconnectConfirm}
      />
    </>
  );
};

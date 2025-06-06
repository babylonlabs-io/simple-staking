import {
  Avatar,
  AvatarGroup,
  Button,
  Text,
  Toggle,
} from "@babylonlabs-io/core-ui";
import {
  useWalletConnect,
  useWidgetState,
} from "@babylonlabs-io/wallet-connector";
import { useCallback, useMemo, useRef, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { PiWalletBold } from "react-icons/pi";
import { Tooltip } from "react-tooltip";

import bbnIcon from "@/app/assets/bbn.svg";
import bitcoin from "@/app/assets/bitcoin.png";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { useAppState } from "@/app/state";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import { getNetworkConfigBBN } from "@/config/network/bbn";

import { Hash } from "../Hash/Hash";
import { MenuButton } from "../Menu/MenuButton";
import { MenuContent } from "../Menu/MenuContent";
import { WalletDisconnectModal } from "../Modals/WalletDisconnectModal";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

interface ConnectProps {
  loading?: boolean;
  onConnect: () => void;
}

const { networkFullName: bbnNetworkFullName } = getNetworkConfigBBN();

export const Connect: React.FC<ConnectProps> = ({
  loading = false,
  onConnect,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { includeOrdinals, excludeOrdinals, ordinalsExcluded } = useAppState();
  const { linkedDelegationsVisibility, displayLinkedDelegations } =
    useDelegationV2State();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Wallet states
  const {
    loading: btcLoading,
    address: btcAddress,
    connected: btcConnected,
    publicKeyNoCoord,
  } = useBTCWallet();
  const {
    loading: bbnLoading,
    bech32Address,
    connected: bbnConnected,
  } = useCosmosWallet();
  const { disconnect } = useWalletConnect();

  // Widget states
  const { selectedWallets } = useWidgetState();

  const {
    isApiNormal,
    isGeoBlocked,
    apiMessage,
    isLoading: isHealthcheckLoading,
  } = useHealthCheck();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const isConnected = useMemo(
    () =>
      btcConnected && bbnConnected && !isGeoBlocked && !isHealthcheckLoading,
    [btcConnected, bbnConnected, isGeoBlocked, isHealthcheckLoading],
  );

  const isLoading =
    isConnected || !isApiNormal || loading || btcLoading || bbnLoading;

  const handleDisconnectClick = useCallback(() => {
    setShowDisconnectModal(true);
  }, []);

  const handleDisconnectCancel = useCallback(() => {
    setShowDisconnectModal(false);
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
      <div className="flex items-center gap-2">
        <Button
          size="large"
          color="secondary"
          className="h-[2.5rem] min-h-[2.5rem] rounded-full px-6 py-2 text-white text-base md:rounded"
          onClick={onConnect}
          disabled={isLoading}
        >
          <PiWalletBold size={20} className="flex md:hidden" />
          <span className="hidden md:flex">Connect Wallets</span>
        </Button>

        <MenuButton
          ref={buttonRef}
          isOpen={isMenuOpen}
          toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        />
        <MenuContent
          anchorEl={buttonRef.current}
          className="p-4"
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        >
          <div className="min-w-[250px]">
            <ThemeToggle />
          </div>
        </MenuContent>

        {!isApiNormal && renderApiNotAvailableTooltip}
      </div>
    );
  }

  const walletContent = (
    <div className="flex flex-col gap-2 w-full min-w-[250px]">
      <div className="flex flex-row gap-2 mb-2">
        <div className="flex items-center justify-center">
          <img
            src={bitcoin}
            alt="bitcoin"
            className="max-w-[40px] max-h-[40px]"
          />
        </div>
        <div className="flex flex-col w-full">
          <Text variant="body1" className="text-accent-primary text-base">
            Bitcoin
          </Text>
          <Hash
            className="text-accent-secondary"
            value={btcAddress}
            address
            noFade
            symbols={12}
          />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <Text variant="body2" className="text-sm text-accent-primary">
          {ordinalsExcluded ? "Not using Inscriptions" : "Using Inscriptions"}
        </Text>
        <div className="flex flex-col items-center justify-center">
          <Toggle
            defaultValue={!ordinalsExcluded}
            onChange={(value) =>
              value ? includeOrdinals() : excludeOrdinals()
            }
            inactiveIcon={<FaLock size={10} />}
            activeIcon={<FaLockOpen size={10} />}
          />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <Text variant="body2" className="text-sm text-accent-primary">
          Linked Wallet Stakes
        </Text>
        <div className="flex flex-col items-center justify-center">
          <Toggle
            value={linkedDelegationsVisibility}
            onChange={displayLinkedDelegations}
          />
        </div>
      </div>
      <div className="flex flex-col justify-start items-start self-stretch mb-1 gap-2">
        <Text variant="body2" className="text-sm text-accent-primary">
          Public Key
        </Text>
        <Hash
          className="text-accent-secondary"
          value={publicKeyNoCoord}
          address
          noFade
          symbols={12}
        />
      </div>
      <div className="divider my-0" />
      <div className="flex flex-row gap-2">
        <div className="flex items-center justify-center">
          <img
            src={bbnIcon}
            alt="babylon"
            className="max-w-[40px] max-h-[40px]"
          />
        </div>
        <div className="flex flex-col w-full">
          <Text variant="body1" className="text-accent-primary text-base">
            {bbnNetworkFullName}
          </Text>
          <Hash
            className="text-accent-secondary"
            value={bech32Address}
            address
            noFade
            symbols={12}
          />
        </div>
      </div>
      <div className="divider my-0" />
      <div
        className="flex items-center justify-start text-secondary-main cursor-pointer transition-colors w-full py-2"
        onClick={handleDisconnectClick}
      >
        <button className="text-sm w-full text-left">Disconnect Wallets</button>
      </div>
      <div className="divider my-0" />
      <ThemeToggle />
    </div>
  );

  return (
    <>
      <div className="relative flex flex-row items-center gap-2">
        <div className="flex flex-row">
          <AvatarGroup max={2} variant="circular">
            <Avatar
              alt={selectedWallets["BTC"]?.name}
              url={selectedWallets["BTC"]?.icon}
              size="large"
              className="object-contain bg-accent-contrast box-content border-[3px] border-primary-main"
            />
            <Avatar
              alt={selectedWallets["BBN"]?.name}
              url={selectedWallets["BBN"]?.icon}
              size="large"
              className="object-contain bg-accent-contrast box-content border-[3px] border-primary-main"
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
        <MenuButton
          ref={buttonRef}
          isOpen={isMenuOpen}
          toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        />

        <MenuContent
          anchorEl={buttonRef.current}
          className="p-4 min-w-[250px]"
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        >
          {walletContent}
        </MenuContent>
      </div>

      <WalletDisconnectModal
        isOpen={showDisconnectModal}
        onClose={handleDisconnectCancel}
        onDisconnect={handleDisconnectConfirm}
        closeMenu={() => setIsMenuOpen(false)}
      />
    </>
  );
};

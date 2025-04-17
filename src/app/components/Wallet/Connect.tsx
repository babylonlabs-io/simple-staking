import { Avatar, AvatarGroup, Text, Toggle } from "@babylonlabs-io/core-ui";
import {
  useWalletConnect,
  useWidgetState,
} from "@babylonlabs-io/wallet-connector";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { Tooltip } from "react-tooltip";

import bbnIcon from "@/app/assets/bbn.svg";
import bitcoin from "@/app/assets/bitcoin.png";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useAuth } from "@/app/contexts/AuthContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { useAppState } from "@/app/state";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import { translations } from "@/app/translations";
import { getNetworkConfigBBN } from "@/config/network/bbn";

import { Hash } from "../Hash/Hash";
import { MenuButton } from "../Menu/MenuButton";
import { MenuContent } from "../Menu/MenuContent";
import { WalletDisconnectModal } from "../Modals/WalletDisconnectModal";

interface ConnectProps {
  loading?: boolean;
  onConnect: () => void;
}

const { networkFullName: bbnNetworkFullName } = getNetworkConfigBBN();

export const Connect: React.FC<ConnectProps> = ({
  loading = false,
  onConnect,
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const { user, logout } = useAuth();
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
    logout();
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
        {/* <AvatarGroup max={3} variant="circular">
          <Avatar
            alt={user?.email || ""}
            url={user?.photoURL || ""}
            size="large"
            className="object-contain bg-accent-contrast box-content border-[3px] border-primary-main"
          />
        </AvatarGroup> */}
        <Text variant="body2" className="text-accent-secondary text-sm">
          {user?.email}
        </Text>
        {/* <button
          // size="large"
          // color="primary"
          className="h-[2.5rem] min-h-[2.5rem] rounded-lg px-6 py-2 text-white text-base md:rounded bg-[#113FE1]"
          onClick={onConnect}
          disabled={isLoading}
        >
          <PiWalletBold size={20} className="flex md:hidden" />
          <span className="hidden md:flex">Connect Wallets</span>
        </button> */}

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
          <div className="flex flex-row gap-2 mb-2">
            <div className="flex items-center justify-center">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <div className="flex flex-col w-full">
              <Text variant="body1" className="text-accent-primary text-base">
                Google Account
              </Text>
              <Text variant="body2" className="text-accent-secondary text-sm">
                {user?.email}
              </Text>
            </div>
          </div>
          {/* <div className="min-w-[250px]">
            <ThemeToggle />
          </div> */}
          <div className="divider my-0" />
          <div
            className="flex items-center justify-start text-secondary-main cursor-pointer transition-colors w-full py-2"
            onClick={handleDisconnectClick}
          >
            <button className="text-sm w-full text-left">{t.logout}</button>
          </div>
          <div className="divider my-0" />
        </MenuContent>

        {!isApiNormal && renderApiNotAvailableTooltip}
      </div>
    );
  }

  const walletContent = (
    <div className="flex flex-col gap-2 w-full min-w-[250px]">
      <div className="flex flex-row gap-2 mb-2">
        <div className="flex items-center justify-center">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        </div>
        <div className="flex flex-col w-full">
          <Text variant="body1" className="text-accent-primary text-base">
            Google Account
          </Text>
          <Text variant="body2" className="text-accent-secondary text-sm">
            {user?.email}
          </Text>
        </div>
      </div>
      <div className="divider my-0" />
      <div className="flex flex-row gap-2 mb-2">
        <div className="flex items-center justify-center">
          <Image
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
          <Image
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
        <button className="text-sm w-full text-left">{t.logout}</button>
      </div>
      {/* <div className="divider my-0" />
      <ThemeToggle /> */}
    </div>
  );

  return (
    <>
      <div className="relative flex flex-row items-center gap-2">
        <div className="flex flex-row">
          <AvatarGroup max={3} variant="circular">
            <Avatar
              alt={user?.email || ""}
              url={user?.photoURL || ""}
              size="large"
              className="object-contain bg-accent-contrast box-content border-[3px] border-primary-main"
            />
            <Avatar
              alt={selectedWallets["BTC"]?.name}
              url={selectedWallets["BTC"]?.icon}
              size="small"
              className="object-contain bg-accent-contrast box-content border-[3px] border-primary-main"
            />
            <Avatar
              alt={selectedWallets["BBN"]?.name}
              url={selectedWallets["BBN"]?.icon}
              size="small"
              className="object-contain bg-accent-contrast box-content border-[3px] border-primary-main"
            />
          </AvatarGroup>
        </div>
        {/* <div className="hidden md:flex flex-col text-secondary-contrast">
          <Text variant="body1">Wallet Connected</Text>
          <div className="flex flex-row text-sm gap-2">
            <Text variant="body1">{btcAddress.slice(0, 6)}</Text>
            <Text variant="body1">|</Text>
            <Text variant="body1">{bech32Address.slice(0, 6)}</Text>
          </div>
        </div> */}
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

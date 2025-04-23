import { Avatar, Text } from "@babylonlabs-io/core-ui";
import {
  useWalletConnect,
  useWidgetState,
} from "@babylonlabs-io/wallet-connector";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { Tooltip } from "react-tooltip";

import bbnIcon from "@/app/assets/bbn.svg";
import bitcoin from "@/app/assets/bitcoin.png";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { useAppState } from "@/app/state";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { Button, Icon, Switch, WalletCapsule } from "@/ui";

import { Hash } from "../Hash/Hash";
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
    setIsMenuOpen(false);
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
          className="cursor-pointer text-xs pr-1.5"
          data-tooltip-id="tooltip-connect"
          data-tooltip-content={apiMessage}
          data-tooltip-place="bottom"
        >
          <Icon iconKey="infoCircle" size={16} />
        </span>
        <Tooltip id="tooltip-connect" className="tooltip-wrap" />
      </>
    );
  }, [isGeoBlocked, isApiNormal, apiMessage]);

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          application
          color="secondary"
          variant="outline"
          onClick={onConnect}
          disabled={isLoading}
          startIcon={{ iconKey: "connect", size: 12 }}
          className="!py-[7px] flounder:!py-1.5"
        >
          <span className="hidden md:flex">Connect Wallets</span>
        </Button>
        {!isApiNormal && !isHealthcheckLoading && renderApiNotAvailableTooltip}
      </div>
    );
  }

  const walletContent = (
    <div className="flex flex-col gap-2 w-full min-w-[250px]">
      <div className="flex flex-row gap-3 mb-2">
        <div className="flex items-center justify-center">
          <Image src={bitcoin} alt="bitcoin" className="max-w-12 max-h-12" />
        </div>
        <div className="flex flex-col w-full">
          <Text
            variant="body1"
            className="text-accent-primary text-body4 font-sans font-bold"
          >
            Bitcoin
          </Text>
          <Hash value={btcAddress} address noFade symbols={12} />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <Text
          variant="body2"
          className="text-callout text-itemSecondaryDefault"
        >
          {ordinalsExcluded ? "Not using Inscriptions" : "Using Inscriptions"}
        </Text>
        <div className="flex flex-col items-center justify-center">
          <Switch
            defaultChecked={!ordinalsExcluded}
            onCheckedChange={(value) =>
              value ? includeOrdinals() : excludeOrdinals()
            }
          />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <Text
          variant="body2"
          className="text-callout text-itemSecondaryDefault"
        >
          Linked Wallet Stakes
        </Text>
        <div className="flex flex-col items-center justify-center">
          <Switch
            defaultChecked={linkedDelegationsVisibility}
            onCheckedChange={displayLinkedDelegations}
          />
        </div>
      </div>
      <div className="flex flex-row justify-between items-center self-stretch mb-1 gap-2">
        <Text
          variant="body2"
          className="text-callout text-itemSecondaryDefault"
        >
          Public Key
        </Text>
        <Hash value={publicKeyNoCoord} address noFade symbols={12} />
      </div>
      <div className="divider my-2" />
      <div className="flex flex-row gap-4">
        <div className="flex items-center justify-center">
          <Image
            src={bbnIcon}
            alt="babylon"
            className="max-w-[40px] max-h-[40px]"
          />
        </div>
        <div className="flex flex-col w-full">
          <Text
            variant="body1"
            className="text-accent-primary text-body4 font-sans font-bold"
          >
            {bbnNetworkFullName}
          </Text>
          <Hash value={bech32Address} address noFade symbols={12} />
        </div>
      </div>
      <div className="divider my-2" />

      <div className="flex justify-end">
        <Button
          application
          size="xs"
          color="secondary"
          variant="outline"
          onClick={handleDisconnectClick}
          className="px-2 py-1.5"
        >
          Disconnect Wallets
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative flex flex-row items-center gap-2">
        <button
          type="button"
          ref={buttonRef}
          onClick={(e) => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center justify-center"
        >
          <WalletCapsule
            as="div"
            className="!py-[7px] flounder:!py-1.5"
            state="connected"
            customContent={
              <div className="flex flex-row gap-1">
                <Avatar
                  alt={selectedWallets["BTC"]?.name}
                  url={selectedWallets["BTC"]?.icon}
                  size="tiny"
                  className="object-contain bg-accent-contrast box-content border-px border-primary-main rounded-sm"
                />
                <Avatar
                  alt={selectedWallets["BBN"]?.name}
                  url={selectedWallets["BBN"]?.icon}
                  size="tiny"
                  className="object-contain bg-accent-contrast box-content border-px border-primary-main rounded-sm"
                />
              </div>
            }
            address={`${btcAddress.slice(0, 6)} | ${bech32Address.slice(0, 6)}`}
            disabled={false}
          />
        </button>

        <MenuContent
          anchorEl={buttonRef.current}
          className="p-4 min-w-[250px] flounder:min-w-[470px]"
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

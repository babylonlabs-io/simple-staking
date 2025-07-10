import { Avatar, AvatarGroup, Button } from "@babylonlabs-io/core-ui";
import { useWidgetState } from "@babylonlabs-io/wallet-connector";
import { useMemo, useRef, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { PiWalletBold } from "react-icons/pi";
import { Tooltip } from "react-tooltip";
import { twMerge } from "tailwind-merge";

import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useHealthCheck } from "@/ui/common/hooks/useHealthCheck";
import { useAppState } from "@/ui/common/state";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";

import {
  SettingMenuButton,
  SettingMenuContainer,
  SettingMenuContent,
} from "../Menu/SettingMenu";
import { WalletMenuContainer } from "../Menu/WalletMenu";

interface ConnectProps {
  loading?: boolean;
  onConnect: () => void;
}

export const Connect: React.FC<ConnectProps> = ({
  loading = false,
  onConnect,
}) => {
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const handleOpenChange = (open: boolean) => {
    setIsWalletMenuOpen(open);
  };

  // App state and wallet context
  const { includeOrdinals, excludeOrdinals, ordinalsExcluded } = useAppState();
  const { linkedDelegationsVisibility, displayLinkedDelegations } =
    useDelegationV2State();

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

  // Widget states
  const { selectedWallets } = useWidgetState();

  const {
    isApiNormal,
    isGeoBlocked,
    apiMessage,
    isLoading: isHealthcheckLoading,
  } = useHealthCheck();
  const isConnected = useMemo(
    () =>
      btcConnected && bbnConnected && !isGeoBlocked && !isHealthcheckLoading,
    [btcConnected, bbnConnected, isGeoBlocked, isHealthcheckLoading],
  );

  const isLoading =
    isConnected || !isApiNormal || loading || btcLoading || bbnLoading;

  const transformedWallets = useMemo(() => {
    const result: Record<string, { name: string; icon: string }> = {};
    Object.entries(selectedWallets).forEach(([key, wallet]) => {
      if (wallet) {
        result[key] = { name: wallet.name, icon: wallet.icon };
      }
    });
    return result;
  }, [selectedWallets]);

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

  // DISCONNECTED STATE: Show connect button + settings menu
  if (!isConnected) {
    return (
      <div className="flex items-center gap-4">
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

        <SettingMenuButton
          ref={settingsButtonRef}
          toggleMenu={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
        />
        <SettingMenuContainer
          anchorEl={settingsButtonRef.current}
          isOpen={isSettingsMenuOpen}
          onClose={() => setIsSettingsMenuOpen(false)}
        >
          <SettingMenuContent />
        </SettingMenuContainer>

        {!isApiNormal && renderApiNotAvailableTooltip}
      </div>
    );
  }

  // CONNECTED STATE: Show wallet avatars + settings menu
  return (
    <div className="relative flex flex-row items-center gap-4">
      <WalletMenuContainer
        trigger={
          <div className="flex flex-row cursor-pointer">
            <AvatarGroup max={2} variant="circular">
              <Avatar
                alt={selectedWallets["BTC"]?.name}
                url={selectedWallets["BTC"]?.icon}
                size="large"
                className={twMerge(
                  "object-contain bg-accent-contrast box-content",
                  isWalletMenuOpen &&
                    "outline outline-[2px] outline-accent-primary",
                )}
              />
              <Avatar
                alt={selectedWallets["BBN"]?.name}
                url={selectedWallets["BBN"]?.icon}
                size="large"
                className={twMerge(
                  "object-contain bg-accent-contrast box-content",
                  isWalletMenuOpen &&
                    "outline outline-[2px] outline-accent-primary",
                )}
              />
            </AvatarGroup>
          </div>
        }
        btcAddress={btcAddress}
        bbnAddress={bech32Address}
        selectedWallets={transformedWallets}
        ordinalsExcluded={ordinalsExcluded}
        linkedDelegationsVisibility={linkedDelegationsVisibility}
        onIncludeOrdinals={includeOrdinals}
        onExcludeOrdinals={excludeOrdinals}
        onDisplayLinkedDelegations={displayLinkedDelegations}
        publicKeyNoCoord={publicKeyNoCoord}
        onOpenChange={handleOpenChange}
      />

      <SettingMenuButton
        ref={settingsButtonRef}
        toggleMenu={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
      />
      <SettingMenuContainer
        anchorEl={settingsButtonRef.current}
        isOpen={isSettingsMenuOpen}
        onClose={() => setIsSettingsMenuOpen(false)}
      >
        <SettingMenuContent />
      </SettingMenuContainer>
    </div>
  );
};

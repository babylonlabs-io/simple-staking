import {
  Avatar,
  AvatarGroup,
  Button,
  WalletMenu,
} from "@babylonlabs-io/core-ui";
import {
  useWalletConnect,
  useWidgetState,
} from "@babylonlabs-io/wallet-connector";
import { useMemo, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { PiWalletBold } from "react-icons/pi";
import { useLocation } from "react-router";
import { Tooltip } from "react-tooltip";
import { twMerge } from "tailwind-merge";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useUTXOs } from "@/ui/common/hooks/client/api/useUTXOs";
import { useHealthCheck } from "@/ui/common/hooks/useHealthCheck";
import { useAppState } from "@/ui/common/state";
import { useBalanceState } from "@/ui/common/state/BalanceState";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import { ubbnToBaby } from "@/ui/common/utils/bbn";
import { satoshiToBtc } from "@/ui/common/utils/btc";

import { SettingMenuWrapper } from "../Menu/SettingMenu";

interface ConnectProps {
  loading?: boolean;
  onConnect: () => void;
}

export const Connect: React.FC<ConnectProps> = ({
  loading = false,
  onConnect,
}) => {
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const handleOpenChange = (open: boolean) => {
    setIsWalletMenuOpen(open);
  };

  const location = useLocation();
  const isBabyRoute = location.pathname.startsWith("/baby");
  const requireBothWallets = !isBabyRoute;

  // App state and wallet context
  const { includeOrdinals, excludeOrdinals, ordinalsExcluded } = useAppState();
  const { linkedDelegationsVisibility, displayLinkedDelegations } =
    useDelegationV2State();

  // Balance state
  const {
    bbnBalance,
    stakableBtcBalance,
    stakedBtcBalance,
    inscriptionsBtcBalance,
    loading: isBalanceLoading,
  } = useBalanceState();

  // UTXO data for unconfirmed transactions check
  const { allUTXOs = [], confirmedUTXOs = [] } = useUTXOs();
  const hasUnconfirmedUTXOs = allUTXOs.length > confirmedUTXOs.length;

  // Network configs for coin symbols
  const { coinSymbol: btcCoinSymbol } = getNetworkConfigBTC();
  const { coinSymbol: bbnCoinSymbol } = getNetworkConfigBBN();

  // Balance data for WalletMenu
  const btcBalances = {
    staked: stakedBtcBalance,
    stakable: stakableBtcBalance,
    inscriptions: inscriptionsBtcBalance,
  };

  const bbnBalances = {
    available: bbnBalance,
  };

  // Unified balance formatter
  const formatBalance = (amount: number, coinSymbol: string) => {
    if (coinSymbol === btcCoinSymbol) {
      return `${satoshiToBtc(amount)} ${coinSymbol}`;
    } else if (coinSymbol === bbnCoinSymbol) {
      return `${ubbnToBaby(amount)} ${coinSymbol}`;
    }
    return `${amount} ${coinSymbol}`;
  };

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
  const { disconnect } = useWalletConnect();

  const {
    isApiNormal,
    isGeoBlocked,
    apiMessage,
    isLoading: isHealthcheckLoading,
  } = useHealthCheck();

  const isConnected = useMemo(
    () =>
      (requireBothWallets ? btcConnected && bbnConnected : bbnConnected) &&
      !isGeoBlocked &&
      !isHealthcheckLoading,
    [
      requireBothWallets,
      btcConnected,
      bbnConnected,
      isGeoBlocked,
      isHealthcheckLoading,
    ],
  );

  const isLoading =
    isConnected ||
    !isApiNormal ||
    loading ||
    (requireBothWallets ? btcLoading || bbnLoading : bbnLoading);

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

        <SettingMenuWrapper />

        {!isApiNormal && renderApiNotAvailableTooltip}
      </div>
    );
  }

  // CONNECTED STATE: Show wallet avatars + settings menu
  return (
    <div className="relative flex flex-row items-center gap-4">
      <WalletMenu
        trigger={
          <div className="cursor-pointer">
            <AvatarGroup max={2} variant="circular">
              {selectedWallets["BTC"] ? (
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
              ) : null}
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
        onDisconnect={disconnect}
        onOpenChange={handleOpenChange}
        // Balance-related props
        btcBalances={btcBalances}
        bbnBalances={bbnBalances}
        balancesLoading={isBalanceLoading}
        hasUnconfirmedTransactions={hasUnconfirmedUTXOs}
        formatBalance={formatBalance}
        btcCoinSymbol={btcCoinSymbol}
        bbnCoinSymbol={bbnCoinSymbol}
      />

      <SettingMenuWrapper />
    </div>
  );
};

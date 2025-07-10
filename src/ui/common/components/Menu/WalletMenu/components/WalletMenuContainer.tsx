import { MobileDialog, Popover } from "@babylonlabs-io/core-ui";
import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import { useCallback, useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";

import { WalletDisconnectModal } from "@/ui/common/components/Modals/WalletDisconnectModal";
import { useIsMobileView } from "@/ui/common/hooks/useBreakpoint";

import { WalletInfoSection } from "./WalletInfoSection";
import { WalletSettingsSection } from "./WalletSettingsSection";

interface WalletMenuProps {
  trigger: React.ReactNode;
  btcAddress: string;
  bbnAddress: string;
  selectedWallets: Record<string, { name: string; icon: string }>;
  ordinalsExcluded: boolean;
  linkedDelegationsVisibility: boolean;
  onIncludeOrdinals: () => void;
  onExcludeOrdinals: () => void;
  onDisplayLinkedDelegations: (value: boolean) => void;
  publicKeyNoCoord: string;
  forceOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const WalletMenuContainer = ({
  trigger,
  btcAddress,
  bbnAddress,
  selectedWallets,
  ordinalsExcluded,
  linkedDelegationsVisibility,
  onIncludeOrdinals,
  onExcludeOrdinals,
  onDisplayLinkedDelegations,
  publicKeyNoCoord,
  forceOpen = false,
  onOpenChange,
}: WalletMenuProps) => {
  const isMobile = useIsMobileView();
  const [isPopoverOpen, setIsPopoverOpen] = useState(forceOpen);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(forceOpen);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const { disconnect } = useWalletConnect();

  // Notify parent when menu open state changes
  useEffect(() => {
    const isOpen = isMobile ? mobileDialogOpen : isPopoverOpen;
    onOpenChange?.(isOpen);
  }, [isPopoverOpen, mobileDialogOpen, isMobile, onOpenChange]);

  const handleDisconnectClick = useCallback(() => {
    setShowDisconnectModal(true);
  }, []);

  const handleDisconnectCancel = useCallback(() => {
    setShowDisconnectModal(false);
  }, []);

  const handleDisconnectConfirm = useCallback(() => {
    setShowDisconnectModal(false);
    setIsPopoverOpen(false);
    setMobileDialogOpen(false);
    disconnect();
  }, [disconnect]);

  const menuContent = (
    <div className="p-4 space-y-6 w-full text-primary-main">
      <WalletInfoSection
        btcAddress={btcAddress}
        bbnAddress={bbnAddress}
        selectedWallets={selectedWallets}
      />

      <WalletSettingsSection
        ordinalsExcluded={ordinalsExcluded}
        linkedDelegationsVisibility={linkedDelegationsVisibility}
        onIncludeOrdinals={onIncludeOrdinals}
        onExcludeOrdinals={onExcludeOrdinals}
        onDisplayLinkedDelegations={onDisplayLinkedDelegations}
        publicKeyNoCoord={publicKeyNoCoord}
      />

      <div className="pt-2">
        <button
          onClick={handleDisconnectClick}
          className="flex items-center justify-center w-full py-3 px-4 bg-error-main text-white font-medium text-sm rounded-lg hover:bg-error-main/90 transition-colors cursor-pointer"
        >
          Disconnect Wallets
        </button>
      </div>
    </div>
  );

  const handleTriggerClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (isMobile) {
      setMobileDialogOpen(true);
    } else {
      setAnchorEl(event.currentTarget);
      setIsPopoverOpen(!isPopoverOpen);
    }
  };

  const handleCloseMenu = useCallback(() => {
    setIsPopoverOpen(false);
    setMobileDialogOpen(false);
  }, []);

  if (isMobile) {
    return (
      <>
        <div onClick={handleTriggerClick}>{trigger}</div>
        <MobileDialog
          open={forceOpen || mobileDialogOpen}
          onClose={handleCloseMenu}
          className="bg-[#FFFFFF] dark:bg-[#252525] text-primary-main"
        >
          {menuContent}
        </MobileDialog>
        <WalletDisconnectModal
          isOpen={showDisconnectModal}
          onClose={handleDisconnectCancel}
          onDisconnect={handleDisconnectConfirm}
          closeMenu={handleCloseMenu}
        />
      </>
    );
  }

  return (
    <>
      <div onClick={handleTriggerClick}>{trigger}</div>
      <Popover
        open={forceOpen || isPopoverOpen}
        anchorEl={anchorEl}
        placement="bottom-end"
        offset={[0, 8]}
        onClickOutside={handleCloseMenu}
        className={twJoin(
          "w-80 shadow-lg border border-[#38708533] bg-[#FFFFFF] dark:bg-[#252525] dark:border-[#404040] rounded-lg",
        )}
      >
        {menuContent}
      </Popover>
      <WalletDisconnectModal
        isOpen={showDisconnectModal}
        onClose={handleDisconnectCancel}
        onDisconnect={handleDisconnectConfirm}
        closeMenu={handleCloseMenu}
      />
    </>
  );
};

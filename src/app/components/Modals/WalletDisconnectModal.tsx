import { DialogBody, DialogFooter } from "@babylonlabs-io/core-ui";
import { useCallback } from "react";

import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { Box, Button, Icon } from "@/ui";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface WalletDisconnectModalProps {
  isOpen: boolean;
  closeMenu: () => void;
  onClose: () => void;
  onDisconnect: () => void;
}

const { networkName } = getNetworkConfigBTC();
const { networkFullName: bbnNetworkFullName } = getNetworkConfigBBN();

export const WalletDisconnectModal = ({
  isOpen,
  closeMenu,
  onClose,
  onDisconnect,
}: WalletDisconnectModalProps) => {
  const handleDisconnect = useCallback(() => {
    onDisconnect();
    closeMenu();
  }, [onDisconnect, closeMenu]);

  return (
    <ResponsiveDialog
      open={isOpen}
      onClose={onClose}
      className="flounder:w-[440px]"
    >
      <DialogBody className="flex flex-col pb-8 pt-4 text-accent-primary items-center">
        <Box flex alignItems="center" justifyContent="center" className="mb-2">
          <Icon
            iconKey="warning"
            className="text-itemSecondaryDefault"
            size={20}
          />
        </Box>

        <h4 className="mb-2 font-sans font-bold text-h5">Disconnect Wallets</h4>

        <p className="font-semibold text-callout text-itemSecondaryDefault text-pretty text-center">
          Disconnecting will log you out of both your {bbnNetworkFullName} Chain
          and {networkName} wallets. You&apos;ll need to reconnect them to
          access your staking account.
        </p>
      </DialogBody>

      <DialogFooter className="flex gap-4">
        <Button
          application
          size="md"
          variant="outline"
          color="secondary"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          application
          size="md"
          onClick={handleDisconnect}
          className="flex-1"
        >
          Disconnect
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};

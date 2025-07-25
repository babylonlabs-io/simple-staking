import {
  Button,
  DialogBody,
  DialogFooter,
  Heading,
  Text,
} from "@babylonlabs-io/core-ui";
import { useCallback } from "react";
import { MdCancel } from "react-icons/md";

import { getNetworkConfigBBN } from "@/ui/legacy/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/legacy/config/network/btc";

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
    <ResponsiveDialog open={isOpen} onClose={onClose}>
      <DialogBody className="flex flex-col pb-8 pt-4 text-accent-primary items-center">
        <div className="bg-primary-contrast relative w-[5.5rem] h-[5.5rem]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <MdCancel className="text-primary-light" size={52} />
          </div>
        </div>
        <Heading variant="h4" className="mt-6 mb-4">
          Disconnect Wallets
        </Heading>
        <Text variant="body1" className="text-center">
          Disconnecting will log you out of both your {bbnNetworkFullName} Chain
          and {networkName} wallets. You&apos;ll need to reconnect them to
          access your staking account.
        </Text>
      </DialogBody>

      <DialogFooter className="flex gap-4">
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleDisconnect}
          className="flex-1"
        >
          Disconnect
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};

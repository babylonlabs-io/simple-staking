import {
  Button,
  DialogBody,
  DialogFooter,
  Heading,
  Text,
} from "@babylonlabs-io/bbn-core-ui";
import Image from "next/image";

import cancelCircle from "@/app/assets/cancel-circle.svg";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface WalletDisconnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
}

export const WalletDisconnectModal = ({
  isOpen,
  onClose,
  onDisconnect,
}: WalletDisconnectModalProps) => {
  return (
    <ResponsiveDialog open={isOpen} onClose={onClose}>
      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark items-center">
        <div className="bg-primary-contrast relative w-[5.5rem] h-[5.5rem]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image src={cancelCircle} alt="Disconnect" width={52} height={52} />
          </div>
        </div>
        <Heading variant="h4" className="mt-6 mb-4">
          Disconnect Wallets
        </Heading>
        <Text variant="body1" className="text-center">
          Disconnecting will log you out of both your Babylon Chain and Bitcoin
          wallets. You&apos;ll need to reconnect them to access your staking
          account.
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
        <Button variant="contained" onClick={onDisconnect} className="flex-1">
          Disconnect
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};

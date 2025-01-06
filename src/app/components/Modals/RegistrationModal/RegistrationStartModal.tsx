import {
  Button,
  DialogBody,
  DialogFooter,
  Heading,
  Text,
} from "@babylonlabs-io/bbn-core-ui";
import Image from "next/image";

import editIcon from "@/app/assets/edit.svg";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { ResponsiveDialog } from "../ResponsiveDialog";

interface RegistrationStartModalProps {
  open: boolean;
  onClose: () => void;
  onProceed?: () => void;
}

const { networkName } = getNetworkConfigBTC();
const { networkFullName } = getNetworkConfigBBN();

export function RegistrationStartModal({
  open,
  onClose,
  onProceed,
}: RegistrationStartModalProps) {
  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark items-center">
        <div className="bg-primary-contrast relative w-[5.5rem] h-[5.5rem]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image src={editIcon} alt="Register" width={44} height={49} />
          </div>
        </div>

        <Heading variant="h4" className="mt-6 mb-4">
          Register to {networkFullName}
        </Heading>

        <Text variant="body1" className="text-center">
          You are about to register your {networkName} stake to the{" "}
          {networkFullName}. The registration requires consenting to slashing
          and the association of your {networkFullName} testnet account with
          your {networkName} address.
        </Text>
      </DialogBody>

      <DialogFooter className="flex gap-4">
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          className="flex-1 text-xs sm:text-base"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onProceed}
          className="flex-1 text-xs sm:text-base"
        >
          Proceed
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
}

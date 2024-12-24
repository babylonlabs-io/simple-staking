import {
  Button,
  DialogBody,
  DialogFooter,
  Heading,
} from "@babylonlabs-io/bbn-core-ui";
import { PropsWithChildren } from "react";
import { MdLooksTwo } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import { shouldDisplayTestingMsg } from "@/config";
import { getNetworkConfig } from "@/config/network.config";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface Phase2HereModalProps {
  className?: string;
  open: boolean;
  onClose: () => void;
}

const { networkName } = getNetworkConfig();

export const Phase2HereModal = ({
  className,
  open,
  onClose,
}: PropsWithChildren<Phase2HereModalProps>) => (
  <ResponsiveDialog
    className={twMerge("max-w-[660px]", className)}
    open={open}
    onClose={onClose}
  >
    <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark gap-4 items-center justify-center">
      <div className="bg-primary-contrast h-20 w-20 flex items-center justify-center">
        <MdLooksTwo className="text-5xl" />
      </div>
      <Heading variant="h4">
        Babylon {shouldDisplayTestingMsg() ? "Test" : ""} Chain is here!
      </Heading>
      <p className="text-base text-center">
        The Babylon blockchain has launched, signalling the start of the new
        phase of the Babylon {shouldDisplayTestingMsg() ? "testnet" : ""}.{" "}
        {networkName} stakers can now register on the
        {shouldDisplayTestingMsg() ? "test" : ""} Babylon blockchain to enhance
        security and earn {shouldDisplayTestingMsg() ? "test" : ""} tokens.
      </p>
      <p className="text-base text-center">
        During the initial phase of the Babylon chain launch, eligibility
        criteria will be in place for stake registration. Over time, access will
        gradually expand to allow the registration of all existing stakers and
        the creation of new ones. Learn more here
      </p>
      {shouldDisplayTestingMsg() && (
        <p className="text-base text-center">
          <br />
          Note: This testnet is not incentivized.
        </p>
      )}
    </DialogBody>

    <DialogFooter className="flex gap-4">
      <Button variant="contained" onClick={onClose} className="flex-1">
        Ok
      </Button>
    </DialogFooter>
  </ResponsiveDialog>
);

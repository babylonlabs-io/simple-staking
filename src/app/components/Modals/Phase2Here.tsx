import {
  Button,
  DialogBody,
  DialogFooter,
  Heading,
} from "@babylonlabs-io/bbn-core-ui";
import { PropsWithChildren } from "react";
import { MdLooksTwo } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface Phase2HereModalProps {
  className?: string;
  open: boolean;
  onClose: () => void;
}

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
      <Heading variant="h4">Transition to Phase 2</Heading>
      <p className="text-base text-center">
        The second phase of the Babylon mainnet has been launched, enabling the
        Bitcoin stakes to provide security and liquidity to a Babylon PoS
        blockchain. If you staked during the first phase, you will need to
        transition your stakes. Head over to the activity tab to identify all
        your stakes that can transition. Criteria for your transitioning:
      </p>
      <ul className="list-disc pl-4 text-base">
        <li>
          <p>
            The finality provider you delegated to during phase-1 has
            transitioned to the phase-2 Babylon chain.
          </p>
        </li>
        <li>
          <p>
            Your stake was created on the first cap of the phase-1 mainnet.
            Currently only cap-1 stakes are allowed to transition to slowly
            onboard the stakes to the phase-2 system in a secure manner.
          </p>
        </li>
      </ul>
    </DialogBody>

    <DialogFooter className="flex gap-4">
      <Button variant="contained" onClick={onClose} className="flex-1">
        Ok
      </Button>
    </DialogFooter>
  </ResponsiveDialog>
);

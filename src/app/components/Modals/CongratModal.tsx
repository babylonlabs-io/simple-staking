import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Heading,
  MobileDialog,
} from "@babylonlabs-io/bbn-core-ui";
import { LuPartyPopper } from "react-icons/lu";

import { useIsMobileView } from "@/app/hooks/useBreakpoint";

interface CongratModalProps {
  open: boolean;
  onClose: () => void;
}

export function CongratModal({ open, onClose }: CongratModalProps) {
  const isMobileView = useIsMobileView();
  const DialogComponent = isMobileView ? MobileDialog : Dialog;

  return (
    <DialogComponent open={open} onClose={onClose}>
      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark gap-4">
        <div className="py-4 flex flex-col items-center gap-4">
          <div className="bg-primary-contrast h-20 w-20 flex items-center justify-center">
            <LuPartyPopper className="text-5xl" />
          </div>
          <Heading variant="h4">Conratulations</Heading>
          <p className="text-base text-center">
            Share feedback or report issues on our{" "}
            <a
              href="https://forum.babylonlabs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-main hover:text-primary-main"
            >
              Forums
            </a>{" "}
            or{" "}
            <a
              href="https://discord.com/invite/babylonglobal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-main hover:text-primary-main"
            >
              Discord
            </a>{" "}
            (#feedback and #support) – thank you for being part of the Babylon
            community!
          </p>
        </div>
      </DialogBody>
      <DialogFooter className="flex gap-4">
        <Button
          variant="contained"
          className="flex-1 text-xs sm:text-base"
          onClick={onClose}
        >
          Done
        </Button>
      </DialogFooter>
    </DialogComponent>
  );
}

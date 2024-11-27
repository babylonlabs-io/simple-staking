import { Button, Heading } from "@babylonlabs-io/bbn-core-ui";
import { LuPartyPopper } from "react-icons/lu";

import { GeneralModal } from "./GeneralModal";

interface CongratModalProps {
  open: boolean;
  onClose: () => void;
}

export function CongratModal({ open, onClose }: CongratModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <div className="flex flex-col gap-8 md:max-w-[34rem] text-primary-dark">
        <div className="py-4 flex flex-col items-center gap-4">
          <LuPartyPopper className="text-5xl" />
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
        <Button onClick={onClose}>
          <span>Done</span>
        </Button>
      </div>
    </GeneralModal>
  );
}

import { LuPartyPopper } from "react-icons/lu";

import { SubmitModal } from "./SubmitModal";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export const SuccessFeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onClose,
}) => (
  <SubmitModal
    icon={<LuPartyPopper className="text-5xl text-primary-light" />}
    title="Congratulations"
    open={open}
    submitButton="Done"
    cancelButton=""
    onSubmit={onClose}
  >
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
  </SubmitModal>
);

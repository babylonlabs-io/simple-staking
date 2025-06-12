import { LuPartyPopper } from "react-icons/lu";

import { SubmitModal } from "./SubmitModal";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export const CancelFeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onClose,
}) => (
  <SubmitModal
    icon={<LuPartyPopper className="text-5xl text-primary-light" />}
    title="We Value Your Feedback"
    open={open}
    submitButton="Done"
    cancelButton=""
    onSubmit={onClose}
  >
    <p className="text-base">
      It looks like you didn’t complete your staking journey. We&apos;d love to
      help you get back on track or hear about any issues you faced.
    </p>

    <ul className="list-disc pl-4 text-base">
      <li>
        <strong>Need Assistance?</strong> Reach out on our{" "}
        <a
          href="https://discord.com/invite/babylonglobal"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary"
        >
          Discord
        </a>{" "}
        (<code>#support</code> channel).
      </li>
      <li>
        <strong>Feedback:</strong> Let us know your thoughts on our{" "}
        <a
          href="https://forum.babylonlabs.io/c/feedback/44"
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary-main hover:text-primary-main"
        >
          Feedback Forum
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
        (<code>#feedback</code> channel).
      </li>
    </ul>

    <p className="text-base">
      Your feedback is crucial for us to improve and provide a seamless
      experience. Thank you for being a part of our Bitcoin Staking Protocol!
    </p>
  </SubmitModal>
);

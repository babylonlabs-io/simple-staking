import { IoMdClose } from "react-icons/io";

import { GeneralModal } from "./GeneralModal";

interface FeedbackModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  type: "success" | "cancel" | null;
}

const SuccessContent = () => {
  return (
    <div className="text-text-black dark:text-white">
      <div className="mt-6 flex flex-col gap-4">
        <p>Congratulations on successfully staking your BTC!</p>
        <p>
          Note that for your Bitcoin Stake to become Active it needs to be
          included in a Bitcoin block with sufficient confirmations. This might
          take up to two hours, so stay tuned!
        </p>
        <p>
          Your participation is crucial to our testnet’s success. We invite you
          to share your experience and feedback in our dedicated thread on the
          Babylon Forum. Your insights are valuable to us and will help us
          understand your experience with Bitcoin staking on our Testnet.
        </p>
        <p>
          Visit the{" "}
          <a
            href="https://forum.babylonlabs.io/c/testnet/41"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            Testnet Feedback Megathread
          </a>{" "}
          to post your thoughts.
        </p>
        <p>
          Thank you for being a part of this groundbreaking journey with us!
        </p>
      </div>
    </div>
  );
};

const CancelContent = () => {
  return (
    <div className="text-text-black dark:text-white">
      <div className="mt-6 flex flex-col gap-4">
        <p>
          We noticed you’re leaving the Bitcoin staking process on our Testnet.
          Your input is important to us, and we’d appreciate it if you can let
          us know why.
        </p>
        <p>
          If you need any help with Bitcoin staking, please{" "}
          <a
            href="https://forum.babylonlabs.io/c/testnet/41"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            Open a New Topic
          </a>{" "}
          on our forum and we’d be happy to assist.
        </p>
        <p>
          You can also add your feedback to the{" "}
          <a
            href="https://forum.babylonlabs.io/t/feedback-megathread/183"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            Testnet Feedback Megathread
          </a>{" "}
          to help us make the process better.
        </p>
        <p>
          Thank you for being a part of our Bitcoin Staking Protocol Testnet
          event!
        </p>
      </div>
    </div>
  );
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onClose,
  type,
}) => {
  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">
          {type === "success"
            ? "Share your Staking Experience!"
            : "We Value Your Feedback"}
        </h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      {type === "success" && <SuccessContent />}
      {type === "cancel" && <CancelContent />}
    </GeneralModal>
  );
};

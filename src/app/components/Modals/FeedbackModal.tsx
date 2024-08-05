import { IoMdClose } from "react-icons/io";

import { getNetworkConfig } from "@/config/network.config";

import { GeneralModal } from "./GeneralModal";

interface FeedbackModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  type: "success" | "cancel" | null;
}

interface ContentProps {
  networkName: string;
}

const SuccessContent: React.FC<ContentProps> = ({ networkName }) => {
  return (
    <div className="text-text-black dark:text-white">
      <div className="mt-6 flex flex-col gap-4">
        <p>
          You have successfully completed your Bitcoin staking journey on our{" "}
          {networkName}. Your contribution helps secure the decentralized
          economy.
        </p>
        <ul className="list-disc pl-4">
          <li>
            <strong>Feedback:</strong> Share your experience on our{" "}
            <a
              href="https://forum.babylonlabs.io/c/feedback/44"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              Feedback Forum
            </a>{" "}
            or{" "}
            <a
              href="https://discord.com/invite/babylonglobal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              Discord
            </a>{" "}
            (<code>#feedback</code> channel).
          </li>
          <li>
            <strong>Report Bugs:</strong> Help us improve by reporting any
            issues on our{" "}
            <a
              href="https://forum.babylonlabs.io/c/support/45"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              Support Forum
            </a>{" "}
            or{" "}
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
        </ul>
        <p>Thank you for being a part of the Babylon community!</p>
      </div>
    </div>
  );
};

const CancelContent: React.FC<ContentProps> = ({ networkName }) => {
  return (
    <div className="text-text-black dark:text-white">
      <div className="mt-6 flex flex-col gap-4">
        <p>
          It looks like you didn’t complete your staking journey. We&apos;d love
          to help you get back on track or hear about any issues you faced.
        </p>
        <ul className="list-disc pl-4">
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
              className="text-primary"
            >
              Feedback Forum
            </a>{" "}
            or{" "}
            <a
              href="https://discord.com/invite/babylonglobal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              Discord
            </a>{" "}
            (<code>#feedback</code> channel).
          </li>
        </ul>
        <p>
          Your feedback is crucial for us to improve and provide a seamless
          experience. Thank you for being a part of our Bitcoin Staking
          Protocol!
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
  const { networkName } = getNetworkConfig();

  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">
          {type === "success" ? "Congratulations!" : "We Value Your Feedback"}
        </h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      {type === "success" && <SuccessContent networkName={networkName} />}
      {type === "cancel" && <CancelContent networkName={networkName} />}
    </GeneralModal>
  );
};

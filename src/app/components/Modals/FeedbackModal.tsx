import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Heading,
  MobileDialog,
} from "@babylonlabs-io/bbn-core-ui";
import { LuPartyPopper } from "react-icons/lu";
import { MdFeedback } from "react-icons/md";

import { useNetworkInfo } from "@/app/hooks/client/api/useNetworkInfo";
import { useIsMobileView } from "@/app/hooks/useBreakpoint";
import { shouldDisplayTestingMsg } from "@/config";
import { getNetworkConfigBTC } from "@/config/network/btc";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  type: "success" | "cancel" | null;
}

interface ContentProps {}
const { networkName, coinName } = getNetworkConfigBTC();

const SuccessContent: React.FC<ContentProps> = () => {
  const { data: networkInfo } = useNetworkInfo();
  const confirmationDepth =
    networkInfo?.params.btcEpochCheckParams?.latestParam
      ?.btcConfirmationDepth || 10;

  return (
    <div className="py-4 flex flex-col items-center gap-4">
      <div className="bg-primary-contrast h-20 w-20 flex items-center justify-center">
        <LuPartyPopper className="text-5xl" />
      </div>
      <Heading variant="h4">Staking Submitted on {networkName}</Heading>
      <p className="text-base text-center">
        Congratulations! Your stake has been successfully submitted to
        {networkName}. When it receives {confirmationDepth} {coinName} {""}
        transaction confirmations your stake will become active on the Babylon
        {shouldDisplayTestingMsg() ? "Test" : ""} Chain.
        <br />
        Your opinion matters! Share feedback or report issues on our{" "}
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
  );
};

const CancelContent: React.FC<ContentProps> = () => {
  return (
    <div className="py-4 flex flex-col items-center gap-4">
      <div className="bg-primary-contrast h-20 w-20 flex items-center justify-center">
        <MdFeedback className="text-5xl" />
      </div>
      <Heading variant="h4">We Value Your Feedback</Heading>
      <p className="text-base">
        It looks like you didn’t complete your staking journey. We&apos;d love
        to help you get back on track or hear about any issues you faced.
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
    </div>
  );
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onClose,
  type,
}) => {
  const isMobileView = useIsMobileView();
  const DialogComponent = isMobileView ? MobileDialog : Dialog;

  return (
    <DialogComponent open={open} onClose={onClose}>
      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark gap-4">
        {type === "success" && <SuccessContent />}
        {type === "cancel" && <CancelContent />}
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
};

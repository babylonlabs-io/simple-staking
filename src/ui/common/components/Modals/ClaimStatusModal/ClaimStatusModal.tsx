import { Loader } from "@babylonlabs-io/core-ui";
import { BiSolidBadgeCheck } from "react-icons/bi";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

import { SubmitModal } from "../SubmitModal";

import { SuccessContent } from "./SuccessContent";

interface ClaimStatusModalProps {
  open: boolean;
  onClose?: () => void;
  loading: boolean;
  transactionHash?: string;
}

const { coinSymbol } = getNetworkConfigBBN();

const MODAL_STEP = {
  processing: {
    icon: <Loader size={48} className="text-primary-light" />,
    title: "Processing Claim",
    submitButton: "",
    cancelButton: "",
    content: null,
  },
  success: {
    icon: <BiSolidBadgeCheck className="text-5xl text-primary-light" />,
    title: `Successfully Claimed ${coinSymbol}`,
    submitButton: "Done",
    cancelButton: "",
    content: (txHash?: string) => <SuccessContent transactionHash={txHash} />,
  },
};

export const ClaimStatusModal = ({
  open,
  onClose,
  loading,
  transactionHash,
}: ClaimStatusModalProps) => {
  const config = loading ? MODAL_STEP.processing : MODAL_STEP.success;

  return (
    <SubmitModal
      open={open}
      onClose={onClose}
      onSubmit={onClose}
      icon={config.icon}
      title={config.title}
      submitButton={config.submitButton}
      cancelButton={config.cancelButton}
    >
      {config.content?.(transactionHash)}
    </SubmitModal>
  );
};

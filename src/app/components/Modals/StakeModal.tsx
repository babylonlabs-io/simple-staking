import { BiSolidBadgeCheck } from "react-icons/bi";

import { getNetworkConfig } from "@/config/network";

import { SubmitModal } from "./SubmitModal";

interface StakeModalProps {
  processing?: boolean;
  open: boolean;
  onSubmit?: () => void;
  onClose?: () => void;
}

const { btc, bbn } = getNetworkConfig();

export const StakeModal = ({
  processing,
  open,
  onSubmit,
  onClose,
}: StakeModalProps) => (
  <SubmitModal
    processing={processing}
    open={open}
    icon={<BiSolidBadgeCheck className="text-5xl" />}
    title="Verified"
    submitButton={`Stake ${btc.coinName}`}
    cancelButton="Close"
    onSubmit={onSubmit}
    onClose={onClose}
  >
    Your request has been verified by the {bbn.networkFullName}. You can now
    stake!
  </SubmitModal>
);

import { BiSolidBadgeCheck } from "react-icons/bi";

import { getNetworkConfig } from "@/ui/common/config/network";

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
    icon={<BiSolidBadgeCheck className="text-5xl text-primary-light" />}
    title="Verified"
    submitButton={
      <>
        Stake <span className="hidden md:inline">{btc.coinName}</span>
      </>
    }
    cancelButton="Later"
    onSubmit={onSubmit}
    onClose={onClose}
  >
    Your request has been verified by the {bbn.networkFullName}. You can now
    stake!
  </SubmitModal>
);

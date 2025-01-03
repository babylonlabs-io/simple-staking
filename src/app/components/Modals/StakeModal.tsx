import { BiSolidBadgeCheck } from "react-icons/bi";

import { getNetworkConfigBTC } from "@/config/network/btc";

import { SubmitModal } from "./SubmitModal";

const { networkName } = getNetworkConfigBTC();

interface StakeModalProps {
  processing?: boolean;
  open: boolean;
  onSubmit?: () => void;
}

export const StakeModal = ({ processing, open, onSubmit }: StakeModalProps) => (
  <SubmitModal
    processing={processing}
    open={open}
    icon={<BiSolidBadgeCheck className="text-5xl" />}
    title="Verified"
    submitButton={`Stake on ${networkName}`}
    onSubmit={onSubmit}
  >
    Your request has been verified by the babylon blockchain. You can now stake
  </SubmitModal>
);

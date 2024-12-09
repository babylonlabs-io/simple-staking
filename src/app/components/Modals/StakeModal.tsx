import { MdEditNote } from "react-icons/md";

import { getNetworkConfig } from "@/config/network.config";

import { SubmitModal } from "./SubmitModal";

const { networkName } = getNetworkConfig();

interface StakeModalProps {
  processing?: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function StakeModal({
  processing,
  open,
  onClose,
  onSubmit,
}: StakeModalProps) {
  return (
    <SubmitModal
      processing={processing}
      open={open}
      icon={<MdEditNote size={52} />}
      title={`Sign and Send to ${networkName}`}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      Lorem ipsum dolor sit amet consectetur. Eget ut sagittis vitae hendrerit
      tempus non pellentesque. Amet enim justo vel quam pharetra sem. Id in arcu
      dignissim.
    </SubmitModal>
  );
}

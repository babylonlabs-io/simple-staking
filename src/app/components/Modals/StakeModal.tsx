import { MdEditNote } from "react-icons/md";

import { SubmitModal } from "./SubmitModal";

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
      title="Sign and Send to BTC"
      onClose={onClose}
      onSubmit={onSubmit}
    >
      Lorem ipsum dolor sit amet consectetur. Eget ut sagittis vitae hendrerit
      tempus non pellentesque. Amet enim justo vel quam pharetra sem. Id in arcu
      dignissim.
    </SubmitModal>
  );
}

import { Text } from "@babylonlabs-io/core-ui";
import { BsFillPatchCheckFill } from "react-icons/bs";

import { SubmitModal } from "@/ui/common/components/Modals/SubmitModal";

interface SuccessModalProps {
  title: string;
  description: string | JSX.Element;
  onClose?: () => void;
}

export function SuccessModal({
  title,
  description,
  onClose,
}: SuccessModalProps) {
  return (
    <SubmitModal
      open
      icon={<BsFillPatchCheckFill size={52} />}
      title={title}
      submitButton="Done"
      cancelButton=""
      onSubmit={onClose}
    >
      <Text variant="body1" className="text-accent-secondary">
        {description}
      </Text>
    </SubmitModal>
  );
}

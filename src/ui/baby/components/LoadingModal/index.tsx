import { Loader, Text } from "@babylonlabs-io/core-ui";

import { SubmitModal } from "@/ui/common/components/Modals/SubmitModal";

interface SuccessModalProps {
  title: string;
  description: string;
}

export function LoadingModal({ title, description }: SuccessModalProps) {
  return (
    <SubmitModal
      open
      icon={<Loader />}
      title={title}
      submitButton=""
      cancelButton=""
    >
      <Text variant="body1" className="text-accent-secondary">
        {description}
      </Text>
    </SubmitModal>
  );
}

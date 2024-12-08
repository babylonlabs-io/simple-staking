import { Text } from "@babylonlabs-io/bbn-core-ui";

import { ConfirmationModal } from "./ConfirmationModal";

interface UnbondModalProps {
  processing: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const SlashingModal = (props: UnbondModalProps) => {
  return (
    <ConfirmationModal title="Withdraw Non-Slashed Balance" {...props}>
      <Text variant="body1" className="pt-8 pb-10">
        The Finality Provider you delegated to has been slashed and removed from
        the network. You can withdraw your non-slashed balance after the
        timelock period ends. Slashed funds cannot be recovered.
      </Text>
    </ConfirmationModal>
  );
};

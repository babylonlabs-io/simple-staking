import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Heading,
  Text,
} from "@babylonlabs-io/bbn-core-ui";
import Image from "next/image";

import warningIcon from "@/app/assets/warning-icon.svg";

interface UnbondingV2ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
}

export const UnbondingV2ErrorModal = ({
  isOpen,
  onDone,
}: UnbondingV2ErrorModalProps) => {
  return (
    <Dialog open={isOpen} hasBackdrop={false}>
      <DialogBody className="pb-8 pt-4 text-primary-dark flex flex-col items-center">
        <Image src={warningIcon} alt="Warning" width={88} height={88} />
        <Heading variant="h5" className="mt-4">
          Unbonding Error
        </Heading>
        <Text variant="body1" className="mt-2 text-center">
          Your request to unbond failed due to: Failed to sign PSBT for the
          unbonding transaction
        </Text>
      </DialogBody>

      <DialogFooter>
        <Button fluid variant="outlined" onClick={onDone}>
          Done
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

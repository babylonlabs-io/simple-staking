import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/bbn-core-ui";

import { getNetworkConfig } from "@/config/network.config";
interface WithdrawV2ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  awaitingWalletResponse: boolean;
}

const { networkName } = getNetworkConfig();

export const WithdrawV2Modal = ({
  isOpen,
  onClose,
  onProceed,
  awaitingWalletResponse,
}: WithdrawV2ModalProps) => {
  const title = "Withdraw";
  const content = (
    <>
      You are about to withdraw your stake. <br /> A transaction fee will be
      deduced from your stake by the {networkName} network
    </>
  );

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader className="text-primary-main" onClose={onClose}>
        {title}
      </DialogHeader>
      <DialogBody className="pb-8 pt-4 text-primary-dark">
        <Text variant="body1">{content}</Text>
      </DialogBody>
      <DialogFooter className="flex gap-4">
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button variant="contained" onClick={onProceed} className="flex-1">
          {awaitingWalletResponse ? (
            <span className="loading loading-spinner loading-xs text-white" />
          ) : (
            "Proceed"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

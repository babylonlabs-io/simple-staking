import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Loader,
  MobileDialog,
  Text,
} from "@babylonlabs-io/bbn-core-ui";

import { useIsMobileView } from "@/app/hooks/useBreakpoint";
import { getNetworkConfig } from "@/config/network.config";

export const MODE_TRANSITION = "transition";
export const MODE_WITHDRAW = "withdraw";
export type MODE = typeof MODE_TRANSITION | typeof MODE_WITHDRAW;

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  awaitingWalletResponse: boolean;
}

const { networkName } = getNetworkConfig();

export const WithdrawModal = ({
  isOpen,
  onClose,
  onProceed,
  awaitingWalletResponse,
}: WithdrawModalProps) => {
  const title = "Withdraw";
  const content = (
    <>
      You are about to withdraw your stake. <br /> A transaction fee will be
      deduced from your stake by the {networkName} network
    </>
  );

  const isMobileView = useIsMobileView();

  const DialogComponent = isMobileView ? MobileDialog : Dialog;

  return (
    <DialogComponent open={isOpen} onClose={onClose}>
      <DialogHeader
        title={title}
        className="text-primary-dark"
        onClose={onClose}
      />
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
            <Loader size={16} className="text-white" />
          ) : (
            "Proceed"
          )}
        </Button>
      </DialogFooter>
    </DialogComponent>
  );
};

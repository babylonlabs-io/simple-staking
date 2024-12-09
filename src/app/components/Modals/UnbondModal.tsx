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

interface UnbondModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  awaitingWalletResponse: boolean;
}

export const UnbondModal = ({
  isOpen,
  onClose,
  onProceed,
  awaitingWalletResponse,
}: UnbondModalProps) => {
  const { networkName, coinName } = getNetworkConfig();
  const isMobileView = useIsMobileView();

  const DialogComponent = isMobileView ? MobileDialog : Dialog;

  return (
    <DialogComponent open={isOpen} onClose={onClose}>
      <DialogHeader
        title="Unbonding"
        onClose={onClose}
        className="text-primary-dark"
      />
      <DialogBody className="pb-8 pt-4 text-primary-dark">
        <Text variant="body1">
          You are about to unbond your stake before its expiration. A
          transaction fee of 0.00005 {coinName} will be deduced from your stake
          by the {networkName} network.
          <br />
          <br />
          The expected unbonding time will be about 7 days. After unbonded, you
          will need to use this dashboard to withdraw your stake for it to
          appear in your wallet.
        </Text>
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
        <Button
          variant="contained"
          onClick={onProceed}
          className="flex-1"
          disabled={awaitingWalletResponse}
        >
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

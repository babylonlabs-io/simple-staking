import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/bbn-core-ui";

interface UnbondModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export const UnbondModal = ({
  isOpen,
  onClose,
  onProceed,
}: UnbondModalProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader className="text-primary-main" onClose={onClose}>
        Unbonding
      </DialogHeader>
      <DialogBody className="pb-8 pt-4 text-primary-dark">
        <Text variant="body1">
          You are about to unbond your stake before its expiration. A
          transaction fee of 0.00005 Signet BTC will be deduced from your stake
          by the BTC signet network.
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
          Done
        </Button>
        <Button variant="contained" onClick={onProceed} className="flex-1">
          Proceed
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  MobileDialog,
  Text,
} from "@babylonlabs-io/bbn-core-ui";

import { useIsMobileView } from "@/app/hooks/useBreakpoint";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

export function InfoModal({ open, onClose }: InfoModalProps) {
  const isMobileView = useIsMobileView();
  const DialogComponent = isMobileView ? MobileDialog : Dialog;

  return (
    <DialogComponent open={open} onClose={onClose}>
      <DialogHeader
        title="Info"
        onClose={onClose}
        className="text-primary-dark"
      />
      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark gap-4">
        <div className="py-4 flex flex-col items-start gap-4">
          <Text variant="body1">
            You can unbond and withdraw your stake anytime with an unbonding
            time of 7 days.
          </Text>
          <Text variant="body1">
            There is also a build-in maximum staking period of 65 weeks.
          </Text>
          <Text variant="body1">
            If the stake is not unbonded before the end of this period, it will
            automatically become withdrawable by you anytime afterwards. The
            above times are approximates based on average BTC block time.
          </Text>
        </div>
      </DialogBody>
      <DialogFooter className="flex gap-4">
        <Button
          variant="contained"
          className="flex-1 text-xs sm:text-base"
          onClick={onClose}
        >
          Done
        </Button>
      </DialogFooter>
    </DialogComponent>
  );
}

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
        title="Stake Timelock and On-Demand Unbonding"
        onClose={onClose}
        className="text-primary-dark"
      />
      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark gap-4">
        <div className="py-4 flex flex-col items-start gap-4">
          <Text variant="body1">
            Stakes made through this dashboard are locked for up to 65 weeks.
            You can on-demand unbond at any time, with withdrawal available
            after a 7-day unbonding period. If the maximum staking period
            expires, your stake becomes withdrawable automatically, with no need
            for prior unbonding.
          </Text>
          <Text variant="body1" className="text-gray-500 italic">
            Note: Timeframes are approximate, based on an average Bitcoin block
            time of 10 minutes.
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

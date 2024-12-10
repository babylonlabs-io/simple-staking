import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Loader,
  Text,
} from "@babylonlabs-io/bbn-core-ui";

import { ResponsiveDialog } from "@/app/components/Modals/ResponsiveDialog";

import { Step } from "./Step";

export enum EOIStepStatus {
  UNSIGNED = "UNSIGNED",
  SIGNED = "SIGNED",
  PROCESSING = "PROCESSING",
}

interface EOIModalProps {
  processing?: boolean;
  open: boolean;
  title: string;
  statuses: {
    slashing: EOIStepStatus;
    unbonding: EOIStepStatus;
    reward: EOIStepStatus;
    eoi: EOIStepStatus;
  };
  onClose?: () => void;
  onSubmit?: () => void;
}

const STEP_STATES = {
  [EOIStepStatus.UNSIGNED]: "upcoming",
  [EOIStepStatus.SIGNED]: "completed",
  [EOIStepStatus.PROCESSING]: "processing",
} as const;

export function EOIModal({
  processing = false,
  open,
  title,
  statuses,
  onClose,
  onSubmit,
}: EOIModalProps) {
  return (
    <ResponsiveDialog
      className="z-[150]"
      backdropClassName="z-[100]"
      open={open}
      onClose={onClose}
      hasBackdrop
    >
      <DialogHeader
        title={title}
        onClose={onClose}
        className="text-primary-dark"
      />

      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark gap-4">
        <Text variant="body1" className="text-primary-main">
          Please sign the following messages
        </Text>

        <div className="py-4 flex flex-col items-start gap-6">
          <Step index={1} state={STEP_STATES[statuses.slashing]}>
            Consent to slashing
          </Step>
          <Step index={2} state={STEP_STATES[statuses.unbonding]}>
            Consent to slashing during unbonding
          </Step>
          <Step index={3} state={STEP_STATES[statuses.reward]}>
            BTC-BBN address binding for receiving staking rewards
          </Step>
          <Step index={4} state={STEP_STATES[statuses.eoi]}>
            Staking transaction registration
          </Step>
        </div>
      </DialogBody>

      <DialogFooter className="flex gap-4">
        {onClose && (
          <Button
            variant="outlined"
            color="primary"
            onClick={onClose}
            className="flex-1 text-xs sm:text-base"
          >
            Cancel
          </Button>
        )}

        {onSubmit && (
          <Button
            disabled={processing}
            variant="contained"
            className="flex-1 text-xs sm:text-base"
            onClick={onSubmit}
          >
            {processing ? <Loader size={16} className="text-white" /> : "Sign"}
          </Button>
        )}
      </DialogFooter>
    </ResponsiveDialog>
  );
}

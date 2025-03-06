import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Loader,
} from "@babylonlabs-io/core-ui";
import { PropsWithChildren } from "react";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface ConfirmationModalProps {
  className?: string;
  processing: boolean;
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
}

export const ConfirmationModal = ({
  className,
  processing,
  open,
  title,
  children,
  onClose,
  onSubmit,
}: PropsWithChildren<ConfirmationModalProps>) => (
  <ResponsiveDialog className={className} open={open} onClose={onClose}>
    <DialogHeader
      title={title}
      className="text-accent-primary"
      onClose={onClose}
    />

    <DialogBody className="text-accent-primary">{children}</DialogBody>

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
        disabled={processing}
        variant="contained"
        onClick={onSubmit}
        className="flex-1"
      >
        {processing ? (
          <Loader size={16} className="text-accent-contrast" />
        ) : (
          "Proceed"
        )}
      </Button>
    </DialogFooter>
  </ResponsiveDialog>
);

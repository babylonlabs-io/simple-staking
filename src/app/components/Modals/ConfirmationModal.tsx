import {
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@babylonlabs-io/core-ui";
import { PropsWithChildren } from "react";

import { Button, cx, LoadingIcon } from "@/ui";

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
  <ResponsiveDialog
    className={cx("flounder:w-[440px]", className)}
    open={open}
    onClose={onClose}
  >
    <DialogHeader
      title={title}
      className="text-accent-primary"
      onClose={onClose}
    />

    <DialogBody className="text-accent-primary">{children}</DialogBody>

    <DialogFooter className="flex gap-4">
      <Button
        variant="outline"
        color="primary"
        onClick={onClose}
        className="flex-1 w-full"
      >
        Cancel
      </Button>

      <Button
        disabled={processing}
        onClick={onSubmit}
        className="flex-1 w-full"
      >
        {processing ? <LoadingIcon size="trout" /> : "Proceed"}
      </Button>
    </DialogFooter>
  </ResponsiveDialog>
);

import {
  Button,
  DialogBody,
  DialogFooter,
  Heading,
  Loader,
  Text,
} from "@babylonlabs-io/bbn-core-ui";
import type { JSX, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface SubmitModalProps {
  className?: string;
  processing?: boolean;
  disabled?: boolean;
  open: boolean;
  icon: JSX.Element;
  title: string | JSX.Element;
  cancelButton?: string;
  submitButton?: string;
  onClose?: () => void;
  onSubmit?: () => void;
}

const DEFAULT_BUTTONS = {
  cancel: "Cancel",
  submit: "Submit",
};

export const SubmitModal = ({
  className,
  processing = false,
  disabled = false,
  icon,
  title,
  children,
  open,
  cancelButton = "Cancel",
  submitButton = "Submit",
  onClose,
  onSubmit,
}: PropsWithChildren<SubmitModalProps>) => (
  <ResponsiveDialog
    className={twMerge("w-[660px] max-w-full", className)}
    open={open}
    onClose={onClose}
  >
    <DialogBody className="text-primary-dark py-16 text-center">
      <div className="inline-flex bg-primary-contrast h-20 w-20 items-center justify-center mb-6">
        {icon}
      </div>

      <Heading variant="h4" className="mb-4">
        {title}
      </Heading>

      <Text as="div">{children}</Text>
    </DialogBody>

    <DialogFooter className="flex gap-4">
      {cancelButton && (
        <Button variant="outlined" className="flex-1" onClick={onClose}>
          {cancelButton}
        </Button>
      )}

      {submitButton && (
        <Button
          disabled={processing || disabled}
          variant="contained"
          className="flex-1"
          onClick={onSubmit}
        >
          {processing ? (
            <Loader size={16} className="text-white" />
          ) : (
            submitButton
          )}
        </Button>
      )}
    </DialogFooter>
  </ResponsiveDialog>
);

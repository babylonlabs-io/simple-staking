import {
  Button,
  DialogBody,
  DialogFooter,
  Loader,
} from "@babylonlabs-io/core-ui";
import type { JSX, PropsWithChildren } from "react";

import { cx } from "@/ui";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface SubmitModalProps {
  className?: string;
  processing?: boolean;
  disabled?: boolean;
  open: boolean;
  icon: JSX.Element;
  title: string | JSX.Element;
  cancelButton?: string | JSX.Element;
  submitButton?: string | JSX.Element;
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
    className={cx("flounder:w-[440px]", className)}
    open={open}
    onClose={onClose}
  >
    <DialogBody className="text-accent-primary py-6 mb-4 text-center">
      <div className="inline-flex bg-primary-contrast items-center justify-center size-7">
        {icon}
      </div>

      <h4 className="mb-2 font-sans font-bold text-h5">{title}</h4>
      <div className="font-medium text-callout text-itemSecondaryDefault text-pretty">
        {children}
      </div>
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

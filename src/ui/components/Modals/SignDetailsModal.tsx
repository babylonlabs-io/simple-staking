import { EventData } from "@babylonlabs-io/btc-staking-ts";
import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@babylonlabs-io/core-ui";

import { SignDetails } from "@/ui/components/SignDetails/SignDetails";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface SignDetailsModalProps {
  open: boolean;
  onClose: () => void;
  details: EventData;
  title?: string;
}

export const SignDetailsModal: React.FC<SignDetailsModalProps> = ({
  open,
  onClose,
  details,
  title = "Sign Details",
}) => {
  const capitalizedTitle = title
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <ResponsiveDialog open={open} onClose={onClose} hasBackdrop>
      <DialogHeader
        title={capitalizedTitle}
        onClose={onClose}
        className="text-accent-primary"
      />
      <DialogBody className="flex flex-col pb-8 pt-4 text-accent-primary gap-4">
        <div className="border border-secondary-strokeLight p-4 mt-4 bg-primary-contrast/50 rounded max-h-60 overflow-y-auto flex flex-col gap-4">
          <SignDetails details={details} />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          className="flex-1 text-xs sm:text-base"
        >
          Close
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};

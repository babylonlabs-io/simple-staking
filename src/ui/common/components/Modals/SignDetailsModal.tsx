import { EventData } from "@babylonlabs-io/btc-staking-ts";
import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@babylonlabs-io/core-ui";

import { SignDetails } from "@/ui/common/components/SignDetails/SignDetails";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface SignDetailsModalProps {
  open: boolean;
  onClose: () => void;
  details?: EventData;
  title?: string;
}

export const SignDetailsModal: React.FC<SignDetailsModalProps> = ({
  open,
  onClose,
  details,
  title = "Sign Details",
}) => {
  if (!details) {
    return null;
  }

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
      <DialogBody className="flex flex-col pb-8 pt-4 text-accent-primary gap-4 max-h-72">
        <SignDetails details={details} />
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

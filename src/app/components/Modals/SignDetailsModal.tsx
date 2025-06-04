import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@babylonlabs-io/core-ui";
import { SignPsbtOptions } from "@babylonlabs-io/wallet-connector";

import { ResponsiveDialog } from "@/app/components/Modals/ResponsiveDialog";
import { SignDetails } from "@/app/components/SignDetails/SignDetails";

interface SignDetailsModalProps {
  open: boolean;
  onClose: () => void;
  details: SignPsbtOptions | Record<string, string>;
  title?: string;
}

export const SignDetailsModal: React.FC<SignDetailsModalProps> = ({
  open,
  onClose,
  details,
  title = "Sign Details",
}) => {
  return (
    <ResponsiveDialog open={open} onClose={onClose} hasBackdrop>
      <DialogHeader
        title={title}
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

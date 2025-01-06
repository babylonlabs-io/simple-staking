import {
  Button,
  DialogBody,
  DialogFooter,
  Heading,
} from "@babylonlabs-io/bbn-core-ui";

import { ResponsiveDialog } from "../ResponsiveDialog";

interface RegistrationEndModalProps {
  open: boolean;
  onClose: () => void;
}

export function RegistrationEndModal({
  open,
  onClose,
}: RegistrationEndModalProps) {
  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark items-center">
        <div className="py-4 flex flex-col items-center gap-4">
          <div className="bg-primary-contrast h-20 w-20 flex items-center justify-center">
            <svg
              width="48"
              height="46"
              viewBox="0 0 48 46"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M47.8334 23L42.5467 16.955L43.2834 8.96L35.4617 7.18333L31.3667 0.25L24 3.41333L16.6334 0.25L12.5384 7.16167L4.71669 8.91667L5.45335 16.9333L0.166687 23L5.45335 29.045L4.71669 37.0617L12.5384 38.8383L16.6334 45.75L24 42.565L31.3667 45.7283L35.4617 38.8167L43.2834 37.04L42.5467 29.045L47.8334 23ZM19.8617 33.2267L11.6284 24.9717L14.835 21.765L19.8617 26.8133L32.5367 14.095L35.7434 17.3017L19.8617 33.2267Z"
                fill="#387085"
              />
            </svg>
          </div>
          <Heading variant="h4">Registration Submitted</Heading>
          <p className="text-base text-center">
            Your staking transaction has been successfully registered to the
            Babylon test chain. It will be activated and receive voting power in
            a few blocks. You can monitor the Activity tab for the activation
            status.
          </p>
        </div>
      </DialogBody>

      <DialogFooter className="flex gap-4">
        <Button
          variant="contained"
          onClick={onClose}
          className="flex-1 text-xs sm:text-base"
        >
          Done
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
}

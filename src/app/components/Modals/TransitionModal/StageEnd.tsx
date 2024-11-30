import {
  Button,
  DialogBody,
  DialogFooter,
  Heading,
} from "@babylonlabs-io/bbn-core-ui";
import { IoMdCheckmark } from "react-icons/io";

interface StageEndProps {
  onClose: () => void;
}

export function StageEnd({ onClose }: StageEndProps) {
  return (
    <>
      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark gap-4">
        <div className="py-4 flex flex-col items-center gap-4">
          <div className="bg-primary-contrast h-20 w-20 flex items-center justify-center">
            <IoMdCheckmark className="text-5xl" />
          </div>
          <Heading variant="h4">Transition Submitted</Heading>
          <p className="text-base text-center">
            Your phase-1 staking transaction has been successfully submitted to
            the Babylon blockchain and should be activated and receive voting
            power in a few blocks. Please monitor the Activity tab for the
            activation status.
          </p>
        </div>
      </DialogBody>
      <DialogFooter className="flex gap-4">
        <Button
          variant="contained"
          className="flex-1 text-xs sm:text-base"
          onClick={onClose}
        >
          Confirm
        </Button>
      </DialogFooter>
    </>
  );
}

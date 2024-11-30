import {
  Button,
  DialogBody,
  DialogFooter,
  Heading,
} from "@babylonlabs-io/bbn-core-ui";
import { MdLooksTwo } from "react-icons/md";

interface StageStartProps {
  onClose: () => void;
}

export function StageStart({ onClose }: StageStartProps) {
  return (
    <>
      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark gap-4">
        <div className="py-4 flex flex-col items-center gap-4">
          <div className="bg-primary-contrast h-20 w-20 flex items-center justify-center">
            <MdLooksTwo className="text-5xl" />
          </div>
          <Heading variant="h4">Transition to Phase 2</Heading>
          <p className="text-base text-center">
            You are about to transition your phase-1 stake delegation to secure
            the phase-2 Babylon PoS blockchain. The transition requires the
            association of your Babylon testnet rewards account with your BTC
            key as well as your consent to slashing in the case of equivocation.
          </p>
        </div>
      </DialogBody>
      <DialogFooter className="flex gap-4">
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          className="flex-1 text-xs sm:text-base"
        >
          Cancel
        </Button>
        <Button variant="contained" className="flex-1 text-xs sm:text-base">
          Proceed
        </Button>
      </DialogFooter>
    </>
  );
}

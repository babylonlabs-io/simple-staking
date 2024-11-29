import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Loader,
  Text,
} from "@babylonlabs-io/bbn-core-ui";
import { twMerge } from "tailwind-merge";

import { Tick } from "./Tick";

const StepContent = [
  "Step 1: Consent to slashing",
  "Step 2: Consent to slashing during unbonding ",
  "Step 3: BTC-BBN address binding for receiving staking rewards",
  "Step 4: Staking transaction registration",
];

interface StageSteppingProps {
  onClose: () => void;
  onSign: () => void;
  step: number;
  awaitingResponse?: boolean;
}

export function StageStepping({
  onClose,
  onSign,
  step,
  awaitingResponse = false,
}: StageSteppingProps) {
  return (
    <>
      <DialogHeader
        title="Transition to Phase 2"
        onClose={onClose}
        className="text-primary-dark"
      />
      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark gap-4">
        <Text variant="body1" className="text-primary-main">
          Please sign the following messages
        </Text>
        <div className="py-4 flex flex-col items-start gap-6">
          {StepContent.map((content, index) => (
            <div
              key={content}
              className={twMerge(
                "p-4 flex flex-row items-center justify-start gap-3 rounded border border-primary-dark/20 bg-secondary-contrast self-stretch",
                step !== index + 1 && "opacity-25",
              )}
            >
              {step > index + 1 ? (
                <Tick />
              ) : (
                <div className="rounded-full bg-secondary-main flex h-10 w-10 items-center justify-center">
                  <Text variant="body1" className="text-secondary-contrast">
                    {index + 1}
                  </Text>
                </div>
              )}
              <Text variant="body1" className="text-primary-dark">
                {content}
              </Text>
            </div>
          ))}
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
        <Button
          variant="contained"
          className="flex-1 text-xs sm:text-base"
          onClick={onSign}
        >
          {awaitingResponse ? (
            <Loader size={16} className="text-white" />
          ) : (
            "Sign"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

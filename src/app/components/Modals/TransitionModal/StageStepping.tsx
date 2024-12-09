import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Loader,
  Text,
} from "@babylonlabs-io/bbn-core-ui";

import { Step } from "./Step";

const stepContent = [
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
          {stepContent.map((content, index) => (
            <Step
              key={content}
              completed={step > index + 1}
              active={step === index + 1}
              current={index + 1}
              content={content}
            />
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

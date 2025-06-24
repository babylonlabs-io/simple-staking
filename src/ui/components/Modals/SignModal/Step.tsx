import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Loader,
  Text,
} from "@babylonlabs-io/core-ui";
import { useState, type PropsWithChildren, type ReactNode } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { IoCheckmarkSharp } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

import { useDelegationState } from "@/ui/state/DelegationState";
import { useStakingState } from "@/ui/state/StakingState";

import { SignDetails } from "../../SignDetails/SignDetails";

interface StepProps {
  step: number;
  currentStep: number;
  children: ReactNode;
  shouldShowDetails?: boolean;
}

const renderIcon = (step: number, currentStep: number) => {
  if (currentStep > step) {
    return (
      <div className="rounded-full shrink-0 bg-primary-light flex h-10 w-10 items-center justify-center">
        <IoCheckmarkSharp size={24} className="text-accent-contrast" />
      </div>
    );
  }

  if (currentStep === step) {
    return (
      <div className="rounded-full shrink-0 bg-secondary-main flex h-10 w-10 items-center justify-center">
        <Loader size={24} className="text-accent-contrast" />
      </div>
    );
  }

  return (
    <div className="rounded-full shrink-0 bg-secondary-main flex h-10 w-10 items-center justify-center">
      <Text variant="body1" className="text-accent-contrast">
        {step}
      </Text>
    </div>
  );
};

export const Step = ({
  step,
  currentStep,
  children,
  shouldShowDetails,
}: PropsWithChildren<StepProps>) => {
  const { stakingStepOptions } = useStakingState();
  const { delegationStepOptions } = useDelegationState();
  const [expanded, setExpanded] = useState(false);

  // use either stakingStepOptions or delegationStepOptions
  // base on phase-1 or phase-2
  const stepOptions = stakingStepOptions || delegationStepOptions;
  const showAccordion =
    shouldShowDetails && step === currentStep && stepOptions;

  return (
    <div className="flex flex-col w-full border border-secondary-strokeLight rounded bg-surface">
      {showAccordion ? (
        <Accordion
          expanded={expanded}
          onChange={() => step === currentStep && setExpanded(!expanded)}
        >
          <AccordionSummary
            className="p-4 mr-4"
            renderIcon={() =>
              expanded ? (
                <AiOutlineMinus size={16} />
              ) : (
                <AiOutlinePlus size={16} />
              )
            }
          >
            <div className="flex flex-row items-center gap-3">
              {renderIcon(step, currentStep)}
              <Text variant="body1" className="text-accent-primary">
                Step {step}: {children}
              </Text>
            </div>
          </AccordionSummary>
          <AccordionDetails className="border border-secondary-strokeLight p-4 bg-primary-contrast/50 rounded max-h-60 overflow-y-auto flex flex-col gap-4">
            <SignDetails details={stepOptions} />
          </AccordionDetails>
        </Accordion>
      ) : (
        <div
          className={twMerge(
            "p-4 flex flex-row items-center justify-between gap-3 self-stretch",
            step !== currentStep && "opacity-25",
          )}
        >
          <div className="flex flex-row items-center gap-3">
            {renderIcon(step, currentStep)}
            <Text variant="body1" className="text-accent-primary">
              Step {step}: {children}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

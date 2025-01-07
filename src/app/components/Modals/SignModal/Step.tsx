import { Loader, Text } from "@babylonlabs-io/bbn-core-ui";
import type { PropsWithChildren, ReactNode } from "react";
import { IoCheckmarkSharp } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

interface StepProps {
  step: number;
  currentStep: number;
  children: ReactNode;
}

const renderIcon = (step: number, currentStep: number) => {
  if (currentStep > step) {
    return (
      <div className="rounded-full bg-primary-light flex h-10 w-10 items-center justify-center">
        <IoCheckmarkSharp size={24} className="text-secondary-contrast" />
      </div>
    );
  }

  if (currentStep === step) {
    return (
      <div className="rounded-full bg-secondary-main flex h-10 w-10 items-center justify-center">
        <Loader size={24} className="text-secondary-contrast" />
      </div>
    );
  }

  return (
    <div className="rounded-full bg-secondary-main flex h-10 w-10 items-center justify-center">
      <Text variant="body1" className="text-secondary-contrast">
        {step}
      </Text>
    </div>
  );
};

export const Step = ({
  step,
  currentStep,
  children,
}: PropsWithChildren<StepProps>) => (
  <div
    className={twMerge(
      "p-4 flex flex-row items-center justify-start gap-3 rounded border border-primary-dark/20 bg-secondary-contrast self-stretch",
      step !== currentStep && "opacity-25",
    )}
  >
    {renderIcon(step, currentStep)}

    <Text variant="body1" className="text-primary-dark">
      Step {step}: {children}
    </Text>
  </div>
);

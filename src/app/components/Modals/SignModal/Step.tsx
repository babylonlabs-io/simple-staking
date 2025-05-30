import { Loader, Text } from "@babylonlabs-io/core-ui";
import { SignPsbtOptions } from "@babylonlabs-io/wallet-connector";
import { PropsWithChildren, ReactNode, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { IoCheckmarkSharp } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

import { SignDetails } from "@/app/components/SignDetails/SignDetails";

interface StepProps {
  step: number;
  currentStep: number;
  children: ReactNode;
  details?: SignPsbtOptions | Record<string, string>;
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
  details,
}: PropsWithChildren<StepProps>) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col w-full border border-secondary-strokeLight rounded bg-surface">
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

        {step === currentStep && details && (
          <button
            className={twMerge(
              "border border-secondary-strokeLight flex justify-center items-center rounded bg-surface px-4 py-2 gap-1 hover:text-secondary-main cursor-pointer",
            )}
            onClick={() => step === currentStep && setShowDetails(!showDetails)}
          >
            <div className="hidden md:flex">
              <Text variant="body2">Details</Text>
            </div>
            {showDetails && step === currentStep ? (
              <AiOutlineMinus size={16} />
            ) : (
              <AiOutlinePlus size={16} />
            )}
          </button>
        )}
      </div>

      {showDetails && details && step === currentStep && (
        <div className="border border-secondary-strokeLight p-4 mx-4 mb-4 bg-primary-contrast/50 rounded max-h-60 overflow-y-auto flex flex-col gap-4">
          <SignDetails details={details} />
        </div>
      )}
    </div>
  );
};

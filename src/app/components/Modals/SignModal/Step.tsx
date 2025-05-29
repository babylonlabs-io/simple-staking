import { Loader, Text } from "@babylonlabs-io/core-ui";
import { SignPsbtOptions } from "@babylonlabs-io/wallet-connector"; // Ensure this type is imported
import { PropsWithChildren, ReactNode, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { IoCheckmarkSharp } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
// import { blocksToDisplayTime } from "@/utils/time"; // Import if you have this utility
// import { Hash } from "@/app/components/Hash/Hash"; // Import your Hash component

interface StepProps {
  step: number;
  currentStep: number;
  children: ReactNode;
  details?: SignPsbtOptions | Record<string, string> | string; // Updated details type
}

const keyDisplayMappings: Record<string, string> = {
  stakerPk: "Staker Public Key",
  finalityProviders: "Finality Providers",
  covenantPks: "Covenant Public Keys",
  covenantThreshold: "Covenant Threshold",
  minUnbondingTime: "Min Unbonding Time (blocks)",
  stakingDuration: "Staking Duration (blocks)",
  unbondingTimeBlocks: "Unbonding Time (blocks)",
  // Add more mappings as needed
};

const formatDisplayKey = (key: string): string => {
  return (
    keyDisplayMappings[key] ||
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

const formatContractId = (id: string): string => {
  if (id.startsWith("babylon:")) {
    return id
      .substring("babylon:".length)
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return id;
};

// Placeholder for blocksToDisplayTime - replace with your actual import and usage
const blocksToDisplayTime = (blocks: number) =>
  `${blocks} blocks (~${Math.round(((blocks * 10) / 60 / 24) * 10) / 10} days)`;

const formatDisplayValue = (key: string, value: any): ReactNode => {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (
    typeof value === "number" &&
    (key.toLowerCase().includes("time") ||
      key.toLowerCase().includes("duration") ||
      key.toLowerCase().includes("height"))
  ) {
    // Example: using blocksToDisplayTime for keys containing 'time', 'duration', or 'height'
    // return blocksToDisplayTime(value); // Replace with your actual blocksToDisplayTime call
    return blocksToDisplayTime(value);
  }
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-col items-end max-w-xs">
        {value.map((item, index) => (
          // <Hash key={index} value={String(item)} small noFade /> // Replace with your Hash component
          <Text
            key={index}
            variant="body2"
            className="text-accent-primary break-all truncate"
            title={String(item)}
          >
            {String(item).substring(0, 10)}...
            {String(item).substring(String(item).length - 5)}
          </Text>
        ))}
      </div>
    );
  }
  if (
    typeof value === "string" &&
    (key.toLowerCase().includes("pk") || key.toLowerCase().includes("address"))
  ) {
    // return <Hash value={value} small noFade />; // Replace with your Hash component
    return (
      <Text
        variant="body2"
        className="text-accent-primary break-all truncate max-w-xs"
        title={value}
      >
        {value.substring(0, 10)}...{value.substring(value.length - 5)}
      </Text>
    );
  }
  return (
    <Text variant="body2" className="text-accent-primary break-all text-right">
      {String(value)}
    </Text>
  );
};

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

// Helper function to render string details
const renderStringDetails = (details: string) => (
  <div className="flex justify-between gap-2">
    <Text variant="body2" className="text-accent-secondary">
      Address:
    </Text>
    {formatDisplayValue("address", details)}
  </div>
);

// Helper function to render contract details
const renderContractDetails = (contracts: SignPsbtOptions["contracts"]) => (
  <>
    {contracts?.map((contract, contractIndex) => (
      <div
        key={`contract-${contractIndex}`}
        className="flex flex-col gap-3 border-b border-divider pb-3 last:border-b-0 last:pb-0"
      >
        <Text variant="body1" className="text-accent-primary font-semibold">
          Contract: {formatContractId(contract.id)}
        </Text>
        {contract.params &&
          Object.entries(contract.params).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between items-start gap-2 ml-2"
            >
              <Text
                variant="body2"
                className="text-accent-secondary whitespace-nowrap"
              >
                {formatDisplayKey(key)}:
              </Text>
              {formatDisplayValue(key, value)}
            </div>
          ))}
      </div>
    ))}
  </>
);

// Helper function to render generic object details
const renderObjectDetails = (details: Record<string, string>) => (
  <>
    {Object.entries(details).map(([key, value]) => (
      <div key={key} className="flex justify-between items-start gap-2">
        <Text
          variant="body2"
          className="text-accent-secondary whitespace-nowrap"
        >
          {formatDisplayKey(key)}:
        </Text>
        {formatDisplayValue(key, value)}
      </div>
    ))}
  </>
);

// Helper function to render the entire details section
const renderDetailsSection = (details: StepProps["details"]) => {
  if (typeof details === "string") {
    return renderStringDetails(details);
  }
  if (details && "contracts" in details && Array.isArray(details.contracts)) {
    return renderContractDetails(details.contracts);
  }
  if (typeof details === "object" && details !== null) {
    // This will handle the Record<string, string> case,
    // ensuring it's not the SignPsbtOptions['contracts'] structure already handled.
    return renderObjectDetails(details as Record<string, string>);
  }
  return null;
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
        <div className="border-t border-secondary-strokeLight p-4 mx-4 mb-4 bg-primary-contrast/50 rounded max-h-60 overflow-y-auto flex flex-col gap-4">
          {renderDetailsSection(details)}
        </div>
      )}
    </div>
  );
};

import { Text } from "@babylonlabs-io/core-ui";
import { SignPsbtOptions } from "@babylonlabs-io/wallet-connector";
import { ReactNode } from "react";

import { Hash } from "@/app/components/Hash/Hash";
import { blocksToDisplayTime } from "@/utils/time";

type Details = SignPsbtOptions | Record<string, string>;

interface SignDetailsProps {
  details: Details;
}

const keyDisplayMappings: Record<string, string> = {
  stakerPk: "Staker Public Key",
  finalityProviders: "Finality Providers",
  covenantPks: "Covenant Public Keys",
  covenantThreshold: "Covenant Threshold",
  minUnbondingTime: "Unbonding Time",
  stakingDuration: "Staking Duration",
  unbondingTimeBlocks: "Unbonding Time",
  address: "Address",
};

const formatDisplayKey = (key: string): string => {
  return keyDisplayMappings[key] || key;
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

// Format the display value based on the key and value type
const formatDisplayValue = (key: string, value: any): ReactNode => {
  // Staking duration, unbonding time
  if (
    typeof value === "number" &&
    (key.toLowerCase().includes("time") ||
      key.toLowerCase().includes("duration"))
  ) {
    return (
      <Text
        variant="body2"
        className="text-accent-primary break-all text-right"
      >
        {blocksToDisplayTime(value)}
      </Text>
    );
  }
  // Finality providers, covenant public keys
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-col items-end max-w-xs">
        {value.map((item, index) => (
          <Hash key={index} value={String(item)} small noFade />
        ))}
      </div>
    );
  }
  // Public keys or addresses
  if (
    typeof value === "string" &&
    (key.toLowerCase().includes("pk") || key.toLowerCase().includes("address"))
  ) {
    return <Hash value={value} small noFade />;
  }
  // Default case for other values
  return (
    <Text variant="body2" className="text-accent-primary break-all text-right">
      {String(value)}
    </Text>
  );
};

// Contract details
const renderContractDetails = (contracts: SignPsbtOptions["contracts"]) => (
  <>
    {contracts?.map((contract, contractIndex) => (
      <div
        key={`contract-${contractIndex}`}
        className="flex flex-col gap-4 border-b border-divider pb-4 last:border-b-0 last:pb-0"
      >
        <Text
          variant="body1"
          className="text-accent-primary font-semibold text-left"
        >
          {formatContractId(contract.id)}
        </Text>
        {contract.params &&
          Object.entries(contract.params).map(([key, value]) => (
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
      </div>
    ))}
  </>
);

// Generic details, like { address: "babyAddress" }
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

export const SignDetails: React.FC<SignDetailsProps> = ({ details }) => {
  // Contracts details
  if (details && "contracts" in details && Array.isArray(details.contracts)) {
    return renderContractDetails(details.contracts);
  }
  // Object details, like { address: "babyAddress" }
  if (typeof details === "object" && details !== null) {
    return renderObjectDetails(details as Record<string, string>);
  }
  return null;
};

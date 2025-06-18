import { EventData } from "@babylonlabs-io/btc-staking-ts";
import { Text } from "@babylonlabs-io/core-ui";
import { ReactNode } from "react";

import { Hash } from "@/ui/components/Hash/Hash";
import { blocksToDisplayTime } from "@/ui/utils/time";

interface SignDetailsProps {
  details: EventData;
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
  type: "Type",
  timelockBlocks: "Timelock",
  bech32Address: "BABY Address",
  unbondingFeeSat: "Unbonding Fee",
  slashingFeeSat: "Slashing Fee",
  slashingPkScriptHex: "Slashing Script Hex",
};

const formatDisplayKey = (key: string): string => {
  return keyDisplayMappings[key] || key;
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
          <Hash key={index} value={String(item)} small noFade address />
        ))}
      </div>
    );
  }
  // Public keys
  if (typeof value === "string" && key.toLowerCase().includes("pk")) {
    return <Hash value={value} small noFade address />;
  }
  // Addresses
  if (typeof value === "string" && key.toLowerCase().includes("address")) {
    return <Hash value={value} small noFade address />;
  }
  // Default case for other values
  return (
    <Text variant="body2" className="text-accent-primary break-all text-right">
      {String(value)}
    </Text>
  );
};

export const SignDetails: React.FC<SignDetailsProps> = ({ details }) => {
  return (
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
};

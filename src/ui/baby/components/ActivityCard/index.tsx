import { ActivityCard } from "@babylonlabs-io/core-ui";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

import { ValidatorItem } from "./components/ValidatorItem";

const { logo, coinSymbol } = getNetworkConfigBBN();

export function BabyActivityCard() {
  return (
    <ActivityCard
      data={{
        icon: logo,
        formattedAmount: `100 ${coinSymbol}`,
        primaryAction: {
          label: "Unbond",
          variant: "contained",
          onClick: () => {},
        },
        details: [],
        optionalDetails: [
          {
            label: "Validator",
            value: <ValidatorItem name="Babylon Labs 0" />,
          },
          {
            label: "Commission",
            value: "3%",
          },
          {
            label: "Voting Power",
            value: "17%",
          },
          {
            label: "Unstaking Time",
            value: "19/08/2025",
          },
        ],
      }}
    />
  );
}

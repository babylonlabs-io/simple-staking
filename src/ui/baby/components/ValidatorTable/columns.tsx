import { type ColumnProps, Avatar, Text } from "@babylonlabs-io/core-ui";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { ubbnToBaby } from "@/ui/common/utils/bbn";
import { formatCommissionPercentage } from "@/ui/common/utils/formatCommissionPercentage";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";

import { Validator } from ".";

const { coinSymbol } = getNetworkConfigBBN();

export const columns: ColumnProps<Validator>[] = [
  {
    key: "name",
    header: "Validator",
    headerClassName: "w-[50%]",
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (_, row) => (
      <div className="flex items-center gap-2">
        <Avatar variant="circular" size="small" url="">
          <Text
            as="span"
            className="inline-flex h-full w-full items-center justify-center rounded-full bg-secondary-main text-[1rem] text-accent-contrast uppercase"
          >
            {row.name.charAt(0)}
          </Text>
        </Avatar>
        <span>{row.name}</span>
      </div>
    ),
  },
  {
    key: "votingPower",
    header: "Voting Power",
    headerClassName: "w-[25%]",
    cellClassName: "text-right pr-4",
    sorter: (a, b) => a.votingPower - b.votingPower,
    render: (value) => <>{maxDecimals((value as number) * 100, 2)}%</>,
  },
  {
    key: "commission",
    header: "Commission",
    headerClassName: "w-[25%]",
    cellClassName: "text-right pr-4",
    sorter: (a, b) => a.commission - b.commission,
    render: (value) => <>{formatCommissionPercentage(value as number)}</>,
  },
  {
    key: "tokens",
    header: "Total Staked",
    headerClassName: "w-24",
    cellClassName: "text-right pr-4",
    sorter: (a, b) => a.tokens - b.tokens,
    render: (value) => (
      <>
        {maxDecimals(ubbnToBaby(value as number), 2)} {coinSymbol}
      </>
    ),
  },
];

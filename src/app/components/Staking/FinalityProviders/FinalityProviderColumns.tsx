import { Text } from "@babylonlabs-io/core-ui";

import { Hash } from "@/app/components/Hash/Hash";
import {
  FinalityProvider,
  FinalityProviderState,
  FinalityProviderStateLabels,
} from "@/app/types/finalityProviders";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";

const { coinSymbol } = getNetworkConfigBTC();

const mapStatus = (value: FinalityProviderState): string => {
  return FinalityProviderStateLabels[value] || "Unknown";
};

export const finalityProviderColumns = [
  {
    key: "moniker",
    header: "Finality Provider",
    cellClassName: "text-primary-dark",
    render: (_: unknown, row?: FinalityProvider) => {
      if (!row) return null;

      return (
        <span
          className="inline-flex gap-1 items-center"
          title={row.description?.moniker}
        >
          {/* Replace with KeybaseImage */}
          <Text
            as="span"
            className="inline-flex justify-center items-center bg-secondary-main text-accent-contrast size-5 rounded-full text-[0.6rem]"
          >
            {row.rank}
          </Text>
          {row.description?.moniker || "No name provided"}
        </span>
      );
    },
    sorter: (a?: FinalityProvider, b?: FinalityProvider) => {
      const monikerA = a?.description?.moniker || "";
      const monikerB = b?.description?.moniker || "";
      return monikerA.localeCompare(monikerB);
    },
  },
  {
    key: "state",
    header: "Status",
    render: (value: unknown) => {
      if (value == null) return "Unknown";
      return mapStatus(value as FinalityProviderState);
    },
  },
  {
    key: "btcPk",
    header: `${coinSymbol} PK`,
    render: (_: unknown, row?: FinalityProvider) => {
      if (!row?.btcPk) return null;
      return <Hash value={row.btcPk} address small noFade />;
    },
  },
  {
    key: "activeTVLSat",
    header: "Total Delegation",
    render: (value: unknown) => {
      const amount = Number(value);
      if (isNaN(amount)) return "-";
      return `${maxDecimals(satoshiToBtc(amount), 8)} ${coinSymbol}`;
    },
    sorter: (a?: FinalityProvider, b?: FinalityProvider) => {
      const valueA = a?.activeTVLSat ?? 0;
      const valueB = b?.activeTVLSat ?? 0;
      return valueA - valueB;
    },
  },
  {
    key: "commission",
    header: "Commission",
    render: (value: unknown) => {
      const commission = Number(value);
      if (isNaN(commission)) return "-";
      return `${maxDecimals(commission * 100, 2)}%`;
    },
    sorter: (a?: FinalityProvider, b?: FinalityProvider) => {
      const commissionA = Number(a?.commission) || 0;
      const commissionB = Number(b?.commission) || 0;
      return commissionA - commissionB;
    },
  },
];

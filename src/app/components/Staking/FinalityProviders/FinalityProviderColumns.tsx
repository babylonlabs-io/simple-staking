// import { Avatar } from "@babylonlabs-io/bbn-core-ui";

import { Hash } from "@/app/components/Hash/Hash";
import {
  FinalityProviderState,
  FinalityProviderStateLabels,
  FinalityProviderV2,
} from "@/app/types/finalityProvidersV2";
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
    render: (_: unknown, row?: FinalityProviderV2) => {
      if (!row) return null;
      return (
        <div className="flex items-center gap-2">
          {/* {row.description?.identity && (
            <Avatar
              size="small"
              url={row.description.identity}
              alt={row.description.moniker || ""}
            />
          )} */}
          <span className="text-primary-dark">
            {row.description?.moniker || "No name provided"}
          </span>
        </div>
      );
    },
    sorter: (a?: FinalityProviderV2, b?: FinalityProviderV2) => {
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
    sorter: (a?: FinalityProviderV2, b?: FinalityProviderV2) => {
      const stateA = a?.state || "unknown";
      const stateB = b?.state || "unknown";
      return stateA.localeCompare(stateB);
    },
  },
  {
    key: "btcPk",
    header: `${coinSymbol} PK`,
    render: (_: unknown, row?: FinalityProviderV2) => {
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
    sorter: (a?: FinalityProviderV2, b?: FinalityProviderV2) => {
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
    sorter: (a?: FinalityProviderV2, b?: FinalityProviderV2) => {
      const commissionA = Number(a?.commission) || 0;
      const commissionB = Number(b?.commission) || 0;
      return commissionA - commissionB;
    },
  },
];

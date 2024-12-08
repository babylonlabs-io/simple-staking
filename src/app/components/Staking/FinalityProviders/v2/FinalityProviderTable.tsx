import { Table } from "@babylonlabs-io/bbn-core-ui";
import { useMemo } from "react";

import { Hash } from "@/app/components/Hash/Hash";
import { useFinalityProviderService } from "@/app/hooks/services/useFinalityProviderService";
import {
  FinalityProvider,
  FinalityProviderState,
} from "@/app/types/finalityProviders";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";

import { FPInfo } from "./components/FPInfo";

export const FinalityProviderTable = () => {
  const { isLoading, finalityProviders, hasNextPage, fetchNextPage } =
    useFinalityProviderService();

  const { coinName } = getNetworkConfig();

  const columns = useMemo(
    () => [
      {
        key: "moniker",
        header: "Finality Provider",
        render: (_: unknown, row: FinalityProvider) => (
          <FPInfo
            moniker={row.description?.moniker}
            website={row.description?.website}
          />
        ),
        sorter: (a: FinalityProvider, b: FinalityProvider) =>
          (a.description?.moniker || "").localeCompare(
            b.description?.moniker || "",
          ),
      },
      {
        key: "btcPk",
        header: "BTC PK",
        render: (_: unknown, row: FinalityProvider) => (
          <Hash value={row.btcPk} address small noFade />
        ),
      },
      {
        key: "activeTVLSat",
        header: "Total Delegation",
        render: (value: unknown) =>
          `${maxDecimals(satoshiToBtc(value as number), 8)} ${coinName}`,
        sorter: (a: FinalityProvider, b: FinalityProvider) =>
          a.activeTVLSat - b.activeTVLSat,
      },
      {
        key: "commission",
        header: "Commission",
        render: (value: unknown) => `${maxDecimals(Number(value) * 100, 2)}%`,
        sorter: (a: FinalityProvider, b: FinalityProvider) =>
          Number(a.commission) - Number(b.commission),
      },
      {
        key: "state",
        header: "Status",
        render: (value: unknown) =>
          (value as FinalityProviderState).replace(
            "FINALITY_PROVIDER_STATUS_",
            "",
          ),
      },
    ],
    [coinName],
  );

  const tableData = useMemo(
    () =>
      finalityProviders?.map((fp) => ({
        ...fp,
        id: fp.btcPk,
      })) || [],
    [finalityProviders],
  );

  return (
    <Table
      data={tableData}
      columns={columns}
      loading={isLoading}
      hasMore={hasNextPage}
      onLoadMore={fetchNextPage}
      onRowSelect={() => {}}
      className="max-h-[21rem] overflow-y-auto"
    />
  );
};

import { Avatar, Loader, Table } from "@babylonlabs-io/bbn-core-ui";
import { useMemo } from "react";

import warningOctagon from "@/app/assets/warning-octagon.svg";
import warningTriangle from "@/app/assets/warning-triangle.svg";
import { Hash } from "@/app/components/Hash/Hash";
import { useFinalityProviderService } from "@/app/hooks/services/useFinalityProviderService";
import {
  FinalityProvider,
  FinalityProviderState,
  FinalityProviderStatus,
} from "@/app/types/finalityProviders";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";

import { StatusView } from "./FinalityProviderTableStatusView";

export const FinalityProviderTable = () => {
  const {
    isFetching,
    finalityProviders,
    hasNextPage,
    fetchNextPage,
    searchValue,
    filterValue,
    hasError,
    handleRowSelect,
  } = useFinalityProviderService();

  const { coinName } = getNetworkConfig();

  const mapStatus = (value: FinalityProviderState): string => {
    return FinalityProviderStatus[value] || "Unknown";
  };

  const columns = useMemo(
    () => [
      {
        key: "moniker",
        header: "Finality Provider",
        render: (_: unknown, row: FinalityProvider) => (
          <div className="flex items-center gap-2">
            {row.description?.identity && (
              <Avatar
                size="small"
                url={row.description.identity}
                alt={row.description.moniker || ""}
              />
            )}
            <span className="text-primary-dark">
              {row.description?.moniker || "No name provided"}
            </span>
          </div>
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
        render: (value: unknown) => mapStatus(value as FinalityProviderState),
      },
    ],
    [coinName],
  );

  const tableData = useMemo(
    () => finalityProviders?.map((fp) => ({ ...fp, id: fp.btcPk })) || [],
    [finalityProviders],
  );

  const renderContent = () => {
    if (hasError) {
      return (
        <StatusView
          icon={warningTriangle}
          iconSize={88}
          title="Failed to Load"
          description={
            <>
              The finality provider list failed to load. Please check <br />
              your internet connection or try again later.
            </>
          }
        />
      );
    }

    if (isFetching && tableData.length === 0) {
      return (
        <StatusView
          icon={<Loader className="text-primary-dark" />}
          title="Loading Finality Providers"
        />
      );
    }

    if (!isFetching && tableData.length === 0) {
      return (
        <StatusView
          icon={warningOctagon}
          iconSize={160}
          title="No Matches Found"
        />
      );
    }

    return (
      <div className="max-h-[21rem] overflow-y-auto">
        <Table
          key={`${searchValue}-${filterValue}`}
          data={tableData}
          columns={columns}
          loading={isFetching}
          hasMore={hasNextPage}
          onLoadMore={fetchNextPage}
          onRowSelect={handleRowSelect}
        />
      </div>
    );
  };

  return renderContent();
};

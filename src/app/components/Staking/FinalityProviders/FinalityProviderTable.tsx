import { Avatar, Loader, Table } from "@babylonlabs-io/bbn-core-ui";
import Image from "next/image";
import { useMemo } from "react";

import warningOctagon from "@/app/assets/warning-octagon.svg";
import warningTriangle from "@/app/assets/warning-triangle.svg";
import { Hash } from "@/app/components/Hash/Hash";
import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import {
  FinalityProvider,
  FinalityProviderState,
  FinalityProviderStatus,
} from "@/app/types/finalityProviders";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";

import { StatusView } from "./FinalityProviderTableStatusView";

const { coinName } = getNetworkConfig();

const mapStatus = (value: FinalityProviderState): string => {
  return FinalityProviderStatus[value] || "Unknown";
};

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
  } = useFinalityProviderState();

  const columns = useMemo(
    () => [
      {
        key: "moniker",
        header: "Finality Provider",
        render: (_: unknown, row?: FinalityProvider) => {
          if (!row) return null;
          return (
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
          );
        },
        sorter: (a?: FinalityProvider, b?: FinalityProvider) => {
          const monikerA = a?.description?.moniker || "";
          const monikerB = b?.description?.moniker || "";
          return monikerA.localeCompare(monikerB);
        },
      },
      {
        key: "btcPk",
        header: "BTC PK",
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
          return `${maxDecimals(satoshiToBtc(amount), 8)} ${coinName}`;
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
      {
        key: "state",
        header: "Status",
        render: (value: unknown) => {
          if (value == null) return "Unknown";
          return mapStatus(value as FinalityProviderState);
        },
      },
    ],
    [coinName],
  );

  const tableData = useMemo(() => {
    if (!finalityProviders) return [];
    return finalityProviders.map((fp) => ({
      ...fp,
      id: fp.btcPk,
    }));
  }, [finalityProviders]);

  const renderContent = () => {
    if (hasError) {
      return (
        <StatusView
          icon={
            <Image src={warningTriangle} alt="Warning" width={88} height={88} />
          }
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

    if (isFetching && (!finalityProviders || finalityProviders.length === 0)) {
      return (
        <StatusView
          icon={<Loader className="text-primary-dark" />}
          title="Loading Finality Providers"
        />
      );
    }

    if (!isFetching && (!tableData || tableData.length === 0)) {
      return (
        <StatusView
          icon={
            <Image
              src={warningOctagon}
              alt="Warning"
              width={160}
              height={160}
            />
          }
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

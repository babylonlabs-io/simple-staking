import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  LoadingTableList,
  LoadingView,
} from "@/app/components/Loading/Loading";
import { useFinalityProviderV2Service } from "@/app/hooks/services/useFinalityProviderV2Service";
import type { FinalityProviderV2 as FinalityProviderInterface } from "@/app/types/finalityProviders";

import { FinalityProvider } from "./FinalityProvider";
import { FinalityProviderSearch } from "./FinalityProviderSearch";

export interface FinalityProvidersProps {
  onFinalityProvidersLoad: (data: FinalityProviderInterface[]) => void;
  selectedFinalityProvider: FinalityProviderInterface | undefined;
  onFinalityProviderChange: (btcPkHex: string) => void;
}

export const FinalityProviders: React.FC<FinalityProvidersProps> = ({
  selectedFinalityProvider,
  onFinalityProviderChange,
  onFinalityProvidersLoad,
}) => {
  const {
    isLoading,
    finalityProviders,
    searchValue,
    hasNextPage,
    fetchNextPage,
    handleSearch,
    handleSort,
  } = useFinalityProviderV2Service();

  useEffect(() => {
    if (finalityProviders) {
      onFinalityProvidersLoad(finalityProviders);
    }
  }, [finalityProviders, onFinalityProvidersLoad]);

  if (!finalityProviders?.length) {
    return <LoadingView />;
  }

  return (
    <>
      <p>
        <strong>Step-1:</strong> Select a finality provider
      </p>
      <div className="flex gap-3">
        <FinalityProviderSearch
          searchValue={searchValue}
          onSearch={handleSearch}
        />
      </div>
      <div className="hidden gap-2 px-4 lg:grid lg:grid-cols-stakingFinalityProvidersDesktop">
        <p className="cursor-pointer" onClick={() => handleSort("name")}>
          Finality Provider
        </p>
        <p className="cursor-default">BTC PK</p>
        <p className="cursor-pointer" onClick={() => handleSort("active_tvl")}>
          Total Delegation
        </p>
        <p className="cursor-pointer" onClick={() => handleSort("commission")}>
          Commission
        </p>
        <p className="cursor-default text-right">Status</p>
      </div>
      <div
        id="finality-providers"
        className="no-scrollbar max-h-[21rem] overflow-y-auto"
      >
        <InfiniteScroll
          className="flex flex-col gap-4"
          dataLength={finalityProviders?.length || 0}
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={isLoading ? <LoadingTableList /> : null}
          scrollableTarget="finality-providers"
        >
          {finalityProviders?.map((fp) => (
            <FinalityProvider
              key={fp.btcPk}
              state={fp.state}
              moniker={fp.description?.moniker}
              website={fp.description?.website}
              pkHex={fp.btcPk}
              stakeSat={fp.activeTVLSat}
              commission={fp.commission}
              selected={selectedFinalityProvider?.btcPk === fp.btcPk}
              onClick={() => {
                onFinalityProviderChange(fp.btcPk);
              }}
            />
          ))}
        </InfiniteScroll>
      </div>
    </>
  );
};

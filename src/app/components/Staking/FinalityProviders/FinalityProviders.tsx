import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  PaginatedFinalityProviders,
  getFinalityProviders,
} from "@/app/api/getFinalityProviders";
import {
  LoadingTableList,
  LoadingView,
} from "@/app/components/Loading/Loading";
import { useError } from "@/app/context/Error/ErrorContext";
import { useFinalityProvidersData } from "@/app/hooks/finalityProviders/useFinalityProvidersData";
import { ErrorState } from "@/app/types/errors";
import { FinalityProvidersProps } from "@/app/types/finalityProviders";

import { FinalityProvider } from "./FinalityProvider";
import { FinalityProviderSearch } from "./FinalityProviderSearch";

export const FinalityProviders: React.FC<FinalityProvidersProps> = ({
  selectedFinalityProvider,
  onFinalityProviderChange,
  onFinalityProvidersLoad,
}) => {
  const { isErrorOpen, showError, handleError } = useError();
  const {
    data: fps,
    fetchNextPage: finalityProvidersFetchNext,
    hasNextPage: finalityProvidersHasNext,
    isFetchingNextPage: finalityProvidersIsFetchingMore,
    error: finalityProvidersError,
    isError: hasFinalityProvidersError,
    refetch: refetchFinalityProvidersData,
    isRefetchError: isRefetchFinalityProvidersError,
  } = useInfiniteQuery({
    queryKey: ["finality providers"],
    queryFn: ({ pageParam = "" }) => getFinalityProviders(pageParam, "random"),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.next_key !== ""
        ? lastPage?.pagination?.next_key
        : null,
    initialPageParam: "",
    refetchInterval: 60000, // 1 minute
    select: (data) => {
      const flattenedData = data.pages.reduce<PaginatedFinalityProviders>(
        (acc, page) => {
          acc.finalityProviders.push(...page.finalityProviders);
          acc.pagination = page.pagination;
          return acc;
        },
        { finalityProviders: [], pagination: { next_key: "" } },
      );
      return flattenedData;
    },
    retry: (failureCount, error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  useEffect(() => {
    fps?.finalityProviders && onFinalityProvidersLoad(fps.finalityProviders);
  }, [fps, onFinalityProvidersLoad]);

  useEffect(() => {
    if (
      finalityProvidersHasNext &&
      finalityProvidersFetchNext &&
      !finalityProvidersIsFetchingMore
    ) {
      finalityProvidersFetchNext();
    }
  }, [
    finalityProvidersHasNext,
    finalityProvidersFetchNext,
    finalityProvidersIsFetchingMore,
  ]);

  useEffect(() => {
    handleError({
      error: finalityProvidersError,
      hasError: hasFinalityProvidersError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchFinalityProvidersData,
    });
  }, [
    hasFinalityProvidersError,
    isRefetchFinalityProvidersError,
    finalityProvidersError,
    refetchFinalityProvidersData,
    showError,
    handleError,
  ]);

  const { handleSearch, filteredProviders } = useFinalityProvidersData(
    fps?.finalityProviders,
  );

  if (!fps?.finalityProviders?.length) {
    return <LoadingView />;
  }

  return (
    <>
      <p>
        <strong>Step-1:</strong> Select a finality provider
      </p>
      <div className="flex gap-3">
        <FinalityProviderSearch onSearch={handleSearch} />
      </div>
      <div className="hidden gap-2 px-4 lg:grid lg:grid-cols-stakingFinalityProvidersDesktop">
        <p>Finality Provider</p>
        <p>BTC PK</p>
        <p>Total Delegation</p>
        <p>Commission</p>
      </div>
      <div
        id="finality-providers"
        className="no-scrollbar max-h-[21rem] overflow-y-auto"
      >
        <InfiniteScroll
          className="flex flex-col gap-4"
          dataLength={filteredProviders?.length || 0}
          next={finalityProvidersFetchNext}
          hasMore={finalityProvidersHasNext}
          loader={finalityProvidersIsFetchingMore ? <LoadingTableList /> : null}
          scrollableTarget="finality-providers"
        >
          {filteredProviders?.map((fp) => (
            <FinalityProvider
              key={fp.btcPk}
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

import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useError } from "@/app/context/Error/ErrorContext";
import { useFinalityProviders } from "@/app/hooks/client/api/useFinalityProviders";
import { ErrorState } from "@/app/types/errors";
import { FinalityProvider } from "@/app/types/finalityProviders";

interface SortState {
  field?: string;
  direction?: "asc" | "desc";
}

const SORT_DIRECTIONS = {
  undefined: "desc",
  desc: "asc",
  asc: undefined,
} as const;

export function useFinalityProviderServiceState() {
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState<string | number>("active");
  const [sortState, setSortState] = useState<SortState>({});
  const [selectedFinalityProvider, setSelectedFinalityProvider] =
    useState<FinalityProvider | null>(null);
  const { showError, captureError } = useError();

  const debouncedSearch = useDebounce(searchValue, 300);

  const { data, hasNextPage, fetchNextPage, isFetching, isError, error } =
    useFinalityProviders({
      sortBy: sortState.field,
      order: sortState.direction,
      name: debouncedSearch,
    });

  useEffect(() => {
    if (isError && error) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.SERVER_ERROR,
        },
        retryAction: fetchNextPage,
      });
      captureError(error);
    }
  }, [isError, error, showError, captureError, fetchNextPage]);

  const handleSearch = useCallback((searchTerm: string) => {
    setSearchValue(searchTerm);
  }, []);

  const handleSort = useCallback((sortField: string) => {
    setSortState(({ field, direction }) =>
      field === sortField
        ? {
            field: SORT_DIRECTIONS[`${direction}`] ? field : undefined,
            direction: SORT_DIRECTIONS[`${direction}`],
          }
        : {
            field: sortField,
            direction: "desc",
          },
    );
  }, []);

  const handleFilter = useCallback((value: string | number) => {
    setFilterValue(value);
  }, []);

  const handleRowSelect = useCallback((row: FinalityProvider) => {
    setSelectedFinalityProvider(row);
  }, []);

  const filteredFinalityProviders = useMemo(() => {
    if (!data?.finalityProviders) return [];

    return data.finalityProviders.filter((fp: FinalityProvider) => {
      const statusMatch =
        filterValue === "active"
          ? fp.state === "FINALITY_PROVIDER_STATUS_ACTIVE"
          : filterValue === "inactive"
            ? fp.state !== "FINALITY_PROVIDER_STATUS_ACTIVE"
            : true;

      if (!statusMatch) return false;

      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        return (
          fp.description?.moniker?.toLowerCase().includes(searchLower) ||
          fp.btcPk.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [data?.finalityProviders, filterValue, searchValue]);

  const getFinalityProviderMoniker = useCallback(
    (btcPkHex: string) => {
      const moniker = filteredFinalityProviders.find(
        (fp) => fp.btcPk === btcPkHex,
      )?.description?.moniker;

      if (moniker === undefined || moniker === null || moniker === "") {
        return "-";
      }
      return moniker;
    },
    [filteredFinalityProviders],
  );

  return {
    searchValue,
    filterValue,
    finalityProviders: filteredFinalityProviders,
    selectedFinalityProvider,
    isFetching,
    hasNextPage,
    hasError: isError,
    handleSearch,
    handleSort,
    handleFilter,
    handleRowSelect,
    getFinalityProviderMoniker,
    fetchNextPage,
  };
}

export { useFinalityProviderService } from "@/app/state/FinalityProviderServiceState";

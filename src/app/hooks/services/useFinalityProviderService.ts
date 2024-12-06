import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useState } from "react";

import { useFinalityProviders } from "@/app/hooks/client/api/useFinalityProvidersV2";

interface SortState {
  field?: string;
  direction?: "asc" | "desc";
}

const SORT_DIRECTIONS = {
  undefined: "desc",
  desc: "asc",
  asc: undefined,
} as const;

export function useFinalityProviderService() {
  const [searchValue, setSearchValue] = useState("");
  const [sortState, setSortState] = useState<SortState>({});
  const name = useDebounce(searchValue, 300);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useFinalityProviders({
      sortBy: sortState.field,
      order: sortState.direction,
      name,
    });

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

  const getFinalityProviderMoniker = useCallback(
    (btcPkHex: string) => {
      const moniker = data?.finalityProviders.find(
        (fp) => fp.btcPk === btcPkHex,
      )?.description?.moniker;

      if (moniker === undefined || moniker === null || moniker === "") {
        return "-";
      }
      return moniker;
    },
    [data?.finalityProviders],
  );

  return {
    searchValue,
    finalityProviders: data?.finalityProviders,
    hasNextPage,
    isLoading: isFetchingNextPage,
    fetchNextPage,
    handleSearch,
    handleSort,
    getFinalityProviderMoniker,
  };
}
import { useCallback, useEffect, useMemo, useState } from "react";

import { useFinalityProviders } from "@/app/hooks/api/useFinalityProviders";

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

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useFinalityProviders({
      sortBy: sortState.field,
      order: sortState.direction,
    });

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage?.();
    }
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

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

  const filteredProviders = useMemo(() => {
    const searchRegEx = new RegExp(`${searchValue}`, "i");

    return (
      data?.finalityProviders?.filter(
        (fp) =>
          searchRegEx.test(fp.description?.moniker) ||
          searchRegEx.test(fp.btcPk),
      ) ?? []
    );
  }, [data?.finalityProviders, searchValue]);

  return {
    finalityProviders: data?.finalityProviders,
    filteredProviders,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    handleSearch,
    handleSort,
  };
}

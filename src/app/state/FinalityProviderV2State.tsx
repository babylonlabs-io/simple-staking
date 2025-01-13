import { useDebounce } from "@uidotdev/usehooks";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { useFinalityProvidersV2 } from "@/app/hooks/client/api/useFinalityProvidersV2";
import {
  FinalityProviderState as FinalityProviderStateEnum,
  type FinalityProviderV2,
} from "@/app/types/finalityProvidersV2";
import { createStateUtils } from "@/utils/createStateUtils";

interface SortState {
  field?: string;
  direction?: "asc" | "desc";
}

const SORT_DIRECTIONS = {
  undefined: "desc",
  desc: "asc",
  asc: undefined,
} as const;

const inactiveStatuses = new Set([
  FinalityProviderStateEnum.INACTIVE,
  FinalityProviderStateEnum.JAILED,
  FinalityProviderStateEnum.SLASHED,
]);

interface FinalityProviderV2State {
  searchValue: string;
  filterValue: string | number;
  finalityProviders: FinalityProviderV2[];
  hasNextPage: boolean;
  isFetching: boolean;
  hasError: boolean;
  handleSearch: (searchTerm: string) => void;
  handleSort: (sortField: string) => void;
  handleFilter: (value: string | number) => void;
  isRowSelectable: (row: FinalityProviderV2) => boolean;
  getFinalityProvider: (btcPkHex: string) => FinalityProviderV2 | null;
  fetchNextPage: () => void;
}

const defaultState: FinalityProviderV2State = {
  searchValue: "",
  filterValue: "",
  finalityProviders: [],
  hasNextPage: false,
  isFetching: false,
  hasError: false,
  isRowSelectable: () => false,
  handleSearch: () => {},
  handleSort: () => {},
  handleFilter: () => {},
  getFinalityProvider: () => null,
  fetchNextPage: () => {},
};

const { StateProvider, useState: useFpV2State } =
  createStateUtils<FinalityProviderV2State>(defaultState);

const FinalityProviderV2StateInner = ({ children }: PropsWithChildren) => {
  const searchParams = useSearchParams();
  const fpParam = searchParams.get("fp");

  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState<string | number>(
    fpParam ? "" : "active",
  );
  const [sortState, setSortState] = useState<SortState>({});

  const debouncedSearch = useDebounce(searchValue, 300);

  const { data, hasNextPage, fetchNextPage, isFetching, isError } =
    useFinalityProvidersV2({
      sortBy: sortState.field,
      order: sortState.direction,
      name: debouncedSearch,
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

  const handleFilter = useCallback((value: string | number) => {
    setFilterValue(value);
  }, []);

  const isRowSelectable = useCallback((row: FinalityProviderV2) => {
    return (
      row.state === FinalityProviderStateEnum.ACTIVE ||
      row.state === FinalityProviderStateEnum.INACTIVE
    );
  }, []);

  const filteredFinalityProviders = useMemo(() => {
    if (!data?.finalityProviders) return [];

    return data.finalityProviders.filter((fp: FinalityProviderV2) => {
      if (!fp) return false;

      const isActive = fp.state === FinalityProviderStateEnum.ACTIVE;
      const isInactive = inactiveStatuses.has(fp.state);

      const statusMatch =
        filterValue === "active"
          ? isActive
          : filterValue === "inactive"
            ? isInactive
            : true;

      if (!statusMatch) return false;

      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        return (
          (fp.description?.moniker?.toLowerCase() || "").includes(
            searchLower,
          ) || (fp.btcPk?.toLowerCase() || "").includes(searchLower)
        );
      }

      return true;
    });
  }, [data?.finalityProviders, filterValue, searchValue]);

  const getFinalityProvider = useCallback(
    (btcPkHex: string) =>
      data?.finalityProviders.find(
        (fp: FinalityProviderV2) => fp.btcPk === btcPkHex,
      ) || null,
    [data?.finalityProviders],
  );

  useEffect(() => {
    if (fpParam && data?.finalityProviders) {
      handleSearch(fpParam);
    }
  }, [fpParam, data?.finalityProviders, handleSearch]);

  const state = useMemo(
    () => ({
      searchValue,
      filterValue,
      finalityProviders: filteredFinalityProviders,
      isFetching,
      hasNextPage,
      hasError: isError,
      handleSearch,
      handleSort,
      handleFilter,
      isRowSelectable,
      getFinalityProvider,
      fetchNextPage,
    }),
    [
      searchValue,
      filterValue,
      filteredFinalityProviders,
      isFetching,
      hasNextPage,
      isError,
      handleSearch,
      handleSort,
      handleFilter,
      isRowSelectable,
      getFinalityProvider,
      fetchNextPage,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
};

export function FinalityProviderV2State({ children }: PropsWithChildren) {
  return (
    <Suspense
      fallback={<StateProvider value={defaultState}>{children}</StateProvider>}
    >
      <FinalityProviderV2StateInner>{children}</FinalityProviderV2StateInner>
    </Suspense>
  );
}

export { useFpV2State as useFinalityProviderV2State };

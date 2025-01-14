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

import { useFinalityProviders } from "@/app/hooks/client/api/useFinalityProviders";
import { useFinalityProvidersV2 } from "@/app/hooks/client/api/useFinalityProvidersV2";
import {
  FinalityProviderState as FinalityProviderStateEnum,
  FinalityProviderV1,
  type FinalityProvider,
} from "@/app/types/finalityProviders";
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

interface FinalityProviderState {
  searchValue: string;
  filterValue: string | number;
  finalityProviders: FinalityProvider[];
  hasNextPage: boolean;
  isFetching: boolean;
  hasError: boolean;
  handleSearch: (searchTerm: string) => void;
  handleSort: (sortField: string) => void;
  handleFilter: (value: string | number) => void;
  isRowSelectable: (row: FinalityProvider) => boolean;
  getFinalityProvider: (btcPkHex: string) => FinalityProvider | null;
  fetchNextPage: () => void;
  // V1
  finalityProvidersV1: FinalityProviderV1[];
  hasNextPageV1: boolean;
  isFetchingV1: boolean;
  hasErrorV1: boolean;
  getFinalityProviderV1: (btcPkHex: string) => FinalityProviderV1 | null;
  fetchNextPageV1: () => void;
}

const defaultState: FinalityProviderState = {
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
  // V1
  finalityProvidersV1: [],
  hasNextPageV1: false,
  isFetchingV1: false,
  hasErrorV1: false,
  getFinalityProviderV1: () => null,
  fetchNextPageV1: () => {},
};

const { StateProvider, useState: useFpState } =
  createStateUtils<FinalityProviderState>(defaultState);

const FinalityProviderStateInner = ({ children }: PropsWithChildren) => {
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

  const {
    data: dataV1,
    hasNextPage: hasNextPageV1,
    fetchNextPage: fetchNextPageV1,
    isFetching: isFetchingV1,
    isError: isErrorV1,
  } = useFinalityProviders({
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

  const isRowSelectable = useCallback((row: FinalityProvider) => {
    return (
      row.state === FinalityProviderStateEnum.ACTIVE ||
      row.state === FinalityProviderStateEnum.INACTIVE
    );
  }, []);

  const filteredFinalityProviders = useMemo(() => {
    if (!data?.finalityProviders) return [];

    return data.finalityProviders.filter((fp: FinalityProvider) => {
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
        (fp: FinalityProvider) => fp.btcPk === btcPkHex,
      ) || null,
    [data?.finalityProviders],
  );

  const getFinalityProviderV1 = useCallback(
    (btcPkHex: string) =>
      dataV1?.finalityProviders.find(
        (fp: FinalityProviderV1) => fp.btcPk === btcPkHex,
      ) || null,
    [dataV1?.finalityProviders],
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
      finalityProvidersV1: dataV1?.finalityProviders || [],
      hasNextPageV1,
      isFetchingV1,
      hasErrorV1: isErrorV1,
      getFinalityProviderV1,
      fetchNextPageV1,
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
      dataV1?.finalityProviders,
      hasNextPageV1,
      isFetchingV1,
      isErrorV1,
      getFinalityProviderV1,
      fetchNextPageV1,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
};

export function FinalityProviderState({ children }: PropsWithChildren) {
  return (
    <Suspense
      fallback={<StateProvider value={defaultState}>{children}</StateProvider>}
    >
      <FinalityProviderStateInner>{children}</FinalityProviderStateInner>
    </Suspense>
  );
}

export { useFpState as useFinalityProviderState };

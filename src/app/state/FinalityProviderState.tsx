"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { useSearchParams } from "next/navigation";
import {
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

interface FinalityProviderMaps {
  providersMap: Map<string, FinalityProvider>;
  providersV1Map: Map<string, FinalityProviderV1>;
}

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
  finalityProvidersV1: FinalityProviderV1[];
  getFinalityProviderV1: (btcPkHex: string) => FinalityProviderV1 | null;
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
  finalityProvidersV1: [],
  getFinalityProviderV1: () => null,
};

const { StateProvider, useState: useFpState } =
  createStateUtils<FinalityProviderState>(defaultState);

function FinalityProviderState({ children }: PropsWithChildren) {
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

  const { data: dataV1 } = useFinalityProviders();

  const providerMaps = useMemo<FinalityProviderMaps>(() => {
    const providersMap = new Map<string, FinalityProvider>();
    const providersV1Map = new Map<string, FinalityProviderV1>();

    data?.finalityProviders?.forEach((fp) => {
      if (fp.btcPk) {
        providersMap.set(fp.btcPk, fp);
      }
    });

    dataV1?.finalityProviders?.forEach((fp) => {
      if (fp.btcPk) {
        providersV1Map.set(fp.btcPk, fp);
      }
    });

    return { providersMap, providersV1Map };
  }, [data?.finalityProviders, dataV1?.finalityProviders]);

  const getFinalityProvider = useCallback(
    (btcPkHex: string) => providerMaps.providersMap.get(btcPkHex) || null,
    [providerMaps.providersMap],
  );

  const getFinalityProviderV1 = useCallback(
    (btcPkHex: string) => providerMaps.providersV1Map.get(btcPkHex) || null,
    [providerMaps.providersV1Map],
  );

  const filterFinalityProvider = useCallback(
    (fp: FinalityProvider) => {
      if (!fp) return false;

      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        return (
          (fp.description?.moniker?.toLowerCase() || "").includes(
            searchLower,
          ) || (fp.btcPk?.toLowerCase() || "").includes(searchLower)
        );
      }

      const isActive = fp.state === FinalityProviderStateEnum.ACTIVE;
      const isInactive = inactiveStatuses.has(fp.state);

      if (filterValue === "active") return isActive;
      if (filterValue === "inactive") return isInactive;
      // default to active
      return true;
    },
    [filterValue, searchValue],
  );

  const filteredFinalityProviders = useMemo(() => {
    if (!data?.finalityProviders) return [];
    return data.finalityProviders.filter(filterFinalityProvider);
  }, [data?.finalityProviders, filterFinalityProvider]);

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
      getFinalityProviderV1,
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
      getFinalityProviderV1,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { FinalityProviderState, useFpState as useFinalityProviderState };

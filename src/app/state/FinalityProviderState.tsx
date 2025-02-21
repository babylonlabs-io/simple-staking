import { useDebounce } from "@uidotdev/usehooks";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";

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

interface FilterState {
  search: string;
  status: "active" | "inactive" | "";
}

interface FinalityProviderState {
  filter: FilterState;
  finalityProviders: FinalityProvider[];
  hasNextPage: boolean;
  isFetching: boolean;
  hasError: boolean;
  handleSort: (sortField: string) => void;
  handleFilter: (key: keyof FilterState, value: string) => void;
  isRowSelectable: (row: FinalityProvider) => boolean;
  getFinalityProvider: (btcPkHex: string) => FinalityProvider | null;
  fetchNextPage: () => void;
  getFinalityProviderName: (btcPkHex: string) => string | undefined;
  getSlashedFinalityProvider: (btcPkHex: string) => FinalityProvider | null;
}

const SORT_DIRECTIONS = {
  undefined: "desc",
  desc: "asc",
  asc: undefined,
} as const;

const STATUS_FILTERS = {
  active: (fp: FinalityProvider) =>
    fp.state === FinalityProviderStateEnum.ACTIVE,
  inactive: (fp: FinalityProvider) =>
    fp.state !== FinalityProviderStateEnum.ACTIVE,
};

const FILTERS = {
  search: (fp: FinalityProvider, filter: FilterState) => {
    const pattern = new RegExp(filter.search, "i");

    return (
      pattern.test(fp.description?.moniker ?? "") || pattern.test(fp.btcPk)
    );
  },
  status: (fp: FinalityProvider, filter: FilterState) =>
    filter.status && !filter.search ? STATUS_FILTERS[filter.status](fp) : true,
};

const defaultState: FinalityProviderState = {
  filter: { search: "", status: "active" },
  finalityProviders: [],
  hasNextPage: false,
  isFetching: false,
  hasError: false,
  isRowSelectable: () => false,
  handleSort: () => {},
  handleFilter: () => {},
  getFinalityProvider: () => null,
  fetchNextPage: () => {},
  getFinalityProviderName: () => undefined,
  getSlashedFinalityProvider: () => null,
};

const { StateProvider, useState: useFpState } =
  createStateUtils<FinalityProviderState>(defaultState);

export function FinalityProviderState({ children }: PropsWithChildren) {
  const searchParams = useSearchParams();
  const fpParam = searchParams.get("fp");

  const [filter, setFilter] = useState<FilterState>({
    search: fpParam || "",
    status: "active",
  });
  const [sortState, setSortState] = useState<SortState>({});
  const debouncedSearch = useDebounce(filter.search, 300);

  const { data, hasNextPage, fetchNextPage, isFetching, isError } =
    useFinalityProvidersV2({
      sortBy: sortState.field,
      order: sortState.direction,
      name: debouncedSearch,
    });

  const { data: dataV1 } = useFinalityProviders();

  const providersMap = useMemo(
    () =>
      (data?.finalityProviders ?? [])
        .sort((a, b) => (b.activeTVLSat ?? 0) - (a.activeTVLSat ?? 0))
        .reduce((acc, fp) => {
          if (fp.btcPk) {
            acc.set(fp.btcPk, fp);
          }

          return acc;
        }, new Map<string, FinalityProvider>()),
    [data?.finalityProviders],
  );

  const providersV1Map = useMemo(
    () =>
      (dataV1?.finalityProviders ?? []).reduce((acc, fp) => {
        if (fp.btcPk) {
          acc.set(fp.btcPk, fp);
        }

        return acc;
      }, new Map<string, FinalityProviderV1>()),
    [dataV1?.finalityProviders],
  );

  const getFinalityProviderName = useCallback(
    (btcPkHex: string) =>
      providersMap.get(btcPkHex)?.description?.moniker ??
      providersV1Map.get(btcPkHex)?.description?.moniker,
    [providersMap, providersV1Map],
  );

  const handleFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilter((state) => ({ ...state, [key]: value }));
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

  const isRowSelectable = useCallback((row: FinalityProvider) => {
    return (
      row.state === FinalityProviderStateEnum.ACTIVE ||
      row.state === FinalityProviderStateEnum.INACTIVE
    );
  }, []);

  const filteredFinalityProviders = useMemo(() => {
    if (!data?.finalityProviders) return [];

    return data.finalityProviders.filter((fp: FinalityProvider) =>
      Object.values(FILTERS).every((filterFn) => filterFn(fp, filter)),
    );
  }, [data?.finalityProviders, filter]);

  const getFinalityProvider = useCallback(
    (btcPkHex: string) =>
      data?.finalityProviders.find((fp) => fp.btcPk === btcPkHex) || null,
    [data?.finalityProviders],
  );

  const getSlashedFinalityProvider = useCallback(
    (btcPkHex: string) =>
      data?.finalityProviders.find(
        (fp) =>
          fp.btcPk === btcPkHex &&
          fp.state === FinalityProviderStateEnum.SLASHED,
      ) || null,
    [data?.finalityProviders],
  );

  const state = useMemo(
    () => ({
      filter,
      finalityProviders: filteredFinalityProviders,
      isFetching,
      hasError: isError,
      hasNextPage,
      handleSort,
      handleFilter,
      isRowSelectable,
      getFinalityProvider,
      fetchNextPage,
      getFinalityProviderName,
      getSlashedFinalityProvider,
    }),
    [
      filter,
      filteredFinalityProviders,
      isFetching,
      hasNextPage,
      isError,
      handleSort,
      handleFilter,
      isRowSelectable,
      getFinalityProvider,
      fetchNextPage,
      getFinalityProviderName,
      getSlashedFinalityProvider,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useFpState as useFinalityProviderState };

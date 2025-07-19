import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { useSearchParams } from "react-router";

import { useFinalityProviders } from "@/ui/common/hooks/client/api/useFinalityProviders";
import { useFinalityProvidersV2 } from "@/ui/common/hooks/client/api/useFinalityProvidersV2";
import {
  FinalityProviderState as FinalityProviderStateEnum,
  FinalityProviderV1,
  type FinalityProvider,
} from "@/ui/common/types/finalityProviders";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";
import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";

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
  finalityProviderMap: Map<string, FinalityProvider>;
  hasNextPage: boolean;
  isFetching: boolean;
  hasError: boolean;
  handleSort: (sortField: string) => void;
  handleFilter: (key: keyof FilterState, value: string) => void;
  isRowSelectable: (row: FinalityProvider) => boolean;
  getRegisteredFinalityProvider: (btcPkHex: string) => FinalityProvider | null;
  fetchNextPage: () => void;
  getFinalityProviderName: (btcPkHex: string) => string | undefined;
}

const FP_STATUSES = {
  [FinalityProviderStateEnum.ACTIVE]: 1,
  [FinalityProviderStateEnum.INACTIVE]: 0,
  [FinalityProviderStateEnum.SLASHED]: 0,
  [FinalityProviderStateEnum.JAILED]: 0,
} as const;

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
    const searchTerm = filter.search.toLowerCase();
    return (
      (fp.description?.moniker?.toLowerCase().includes(searchTerm) ?? false) ||
      fp.btcPk.toLowerCase().includes(searchTerm)
    );
  },
  status: (fp: FinalityProvider, filter: FilterState) =>
    filter.status && !filter.search ? STATUS_FILTERS[filter.status](fp) : true,
};

const defaultState: FinalityProviderState = {
  filter: {
    search: "",
    status: "active",
  },
  finalityProviders: [],
  hasNextPage: false,
  isFetching: false,
  hasError: false,
  isRowSelectable: () => false,
  handleSort: () => {},
  handleFilter: () => {},
  getRegisteredFinalityProvider: () => null,
  fetchNextPage: () => {},
  getFinalityProviderName: () => undefined,
  finalityProviderMap: new Map(),
};

const { StateProvider, useState: useFpState } =
  createStateUtils<FinalityProviderState>(defaultState);

export function FinalityProviderState({ children }: PropsWithChildren) {
  const [params] = useSearchParams();
  const fpParam = params.get("fp");

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
      // By default, if no bsn is passed, the FP endpoint will return babylon
      // FP only
      ...(FeatureFlagService.IsPhase3Enabled ? { bsnId: "all" } : {}),
    });

  const { data: dataV1 } = useFinalityProviders();

  const finalityProviders = useMemo(() => {
    if (!data?.finalityProviders) return [];

    return data.finalityProviders
      .sort((a, b) => {
        const condition = FP_STATUSES[b.state] - FP_STATUSES[a.state];

        if (condition !== 0) {
          return condition;
        }

        return (b.activeTVLSat ?? 0) - (a.activeTVLSat ?? 0);
      })
      .map((fp, i) => ({
        ...fp,
        rank: i + 1,
        id: fp.btcPk,
      }));
  }, [data?.finalityProviders]);

  const finalityProviderMap = useMemo(
    () =>
      finalityProviders.reduce((acc, fp) => {
        if (fp.btcPk) {
          acc.set(fp.btcPk, fp);
        }

        return acc;
      }, new Map<string, FinalityProvider>()),
    [finalityProviders],
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
      finalityProviderMap.get(btcPkHex)?.description?.moniker ??
      providersV1Map.get(btcPkHex)?.description?.moniker,
    [finalityProviderMap, providersV1Map],
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
    return finalityProviders.filter((fp: FinalityProvider) =>
      Object.values(FILTERS).every((filterFn) => filterFn(fp, filter)),
    );
  }, [finalityProviders, filter]);

  const getRegisteredFinalityProvider = useCallback(
    (btcPkHex: string) =>
      data?.finalityProviders.find((fp) => fp.btcPk === btcPkHex) || null,
    [data?.finalityProviders],
  );

  const state = useMemo(
    () => ({
      filter,
      finalityProviders: filteredFinalityProviders,
      isFetching,
      hasError: isError,
      hasNextPage,
      finalityProviderMap,
      handleSort,
      handleFilter,
      isRowSelectable,
      getRegisteredFinalityProvider,
      fetchNextPage,
      getFinalityProviderName,
    }),
    [
      filter,
      filteredFinalityProviders,
      isFetching,
      hasNextPage,
      isError,
      finalityProviderMap,
      handleSort,
      handleFilter,
      isRowSelectable,
      getRegisteredFinalityProvider,
      fetchNextPage,
      getFinalityProviderName,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useFpState as useFinalityProviderState };

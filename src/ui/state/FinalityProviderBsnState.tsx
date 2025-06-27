import { useDebounce } from "@uidotdev/usehooks";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { useSearchParams } from "@/ui/context/SearchParamsProvider";
import { useBsn } from "@/ui/hooks/client/api/useBsn";
import { useFinalityProviders } from "@/ui/hooks/client/api/useFinalityProviders";
import { useFinalityProvidersV2 } from "@/ui/hooks/client/api/useFinalityProvidersV2";
import { Bsn } from "@/ui/types/bsn";
import {
  FinalityProviderState as FinalityProviderStateEnum,
  FinalityProviderV1,
  type FinalityProvider,
} from "@/ui/types/finalityProviders";
import { createStateUtils } from "@/ui/utils/createStateUtils";

interface SortState {
  field?: string;
  direction?: "asc" | "desc";
}

interface FilterState {
  search: string;
  status: "active" | "inactive" | "";
}

interface SelectedProvider {
  bsn: Bsn;
  finalityProvider: FinalityProvider;
}

interface FinalityProviderBsnState {
  filter: FilterState;
  finalityProviders: FinalityProvider[];
  finalityProviderMap: Map<string, FinalityProvider>;
  isFetching: boolean;
  hasError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  // BSN
  bsnList: Bsn[];
  bsnLoading: boolean;
  bsnError: boolean;
  selectedBsnId: string | undefined;
  setSelectedBsnId: (id: string | undefined) => void;
  // Modal
  stakingModalPage: StakingModalPage;
  setStakingModalPage: (page: StakingModalPage) => void;
  handleSort: (sortField: string) => void;
  handleFilter: (key: keyof FilterState, value: string) => void;
  isRowSelectable: (row: FinalityProvider) => boolean;
  getRegisteredFinalityProvider: (btcPkHex: string) => FinalityProvider | null;
  getFinalityProviderName: (btcPkHex: string) => string | undefined;
  getSelectedProviders: (
    selectedProviderMap: Record<string, string>,
  ) => SelectedProvider[];
}

export enum StakingModalPage {
  DEFAULT,
  BSN,
  FINALITY_PROVIDER,
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

const defaultState: FinalityProviderBsnState = {
  filter: {
    search: "",
    status: "active",
  },
  finalityProviders: [],
  isFetching: false,
  hasError: false,
  hasNextPage: false,
  fetchNextPage: () => {},
  bsnList: [],
  bsnLoading: false,
  bsnError: false,
  selectedBsnId: undefined,
  setSelectedBsnId: () => {},
  isRowSelectable: () => false,
  handleSort: () => {},
  handleFilter: () => {},
  getRegisteredFinalityProvider: () => null,
  getFinalityProviderName: () => undefined,
  getSelectedProviders: () => [],
  finalityProviderMap: new Map(),
  stakingModalPage: StakingModalPage.DEFAULT,
  setStakingModalPage: () => {},
};

const { StateProvider, useState: useFpBsnState } =
  createStateUtils<FinalityProviderBsnState>(defaultState);

export function FinalityProviderBsnState({ children }: PropsWithChildren) {
  const params = useSearchParams();
  const fpParam = params.get("fp");

  const [stakingModalPage, setStakingModalPage] = useState<StakingModalPage>(
    StakingModalPage.DEFAULT,
  );
  const finalityProviderMap = useRef(new Map<string, FinalityProvider>());

  const [filter, setFilter] = useState<FilterState>({
    search: fpParam || "",
    status: "active",
  });
  const [sortState, setSortState] = useState<SortState>({});
  const debouncedSearch = useDebounce(filter.search, 300);

  const [selectedBsnId, setSelectedBsnId] = useState<string>();
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);

  const { data, isFetching, isError, hasNextPage, fetchNextPage } =
    useFinalityProvidersV2({
      sortBy: sortState.field,
      order: sortState.direction,
      name: debouncedSearch,
      bsnId: selectedBsnId,
      enabled: stakingModalPage === StakingModalPage.FINALITY_PROVIDER,
    });

  const { data: dataV1 } = useFinalityProviders();

  const {
    data: bsnList = [],
    isLoading: bsnLoading,
    isError: bsnError,
  } = useBsn({
    enabled: stakingModalPage === StakingModalPage.BSN,
  });

  const finalityProviders = useMemo(() => {
    if (!data?.finalityProviders) {
      return [];
    }

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

  useEffect(() => {
    finalityProviders.forEach((fp) => {
      finalityProviderMap.current.set(fp.btcPk, fp);
    });
  }, [finalityProviders]);

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

  // TODO: this method is broken (we don't receive all FPs from BE anymore)
  const getFinalityProviderName = useCallback(
    (btcPkHex: string) => {
      const fp =
        finalityProviderMap.current.get(btcPkHex) ??
        providersV1Map.get(btcPkHex);

      if (!fp) return undefined;

      const moniker = fp.description?.moniker?.trim();
      if (moniker) return moniker;

      const bsnId = (fp as FinalityProvider).bsnId;

      if (bsnId === "") {
        return "Babylon";
      }

      if (bsnId) {
        return bsnList.find((bsn) => bsn.id === bsnId)?.name;
      }

      return undefined;
    },
    [finalityProviderMap, providersV1Map, bsnList],
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

  const getSelectedProviders = useCallback(
    (selectedProviderMap: Record<string, string>): SelectedProvider[] => {
      return Object.entries(selectedProviderMap)
        .map(([bsnId, providerId]) => {
          const bsn = bsnList.find((b) => b.id === bsnId);
          const finalityProvider = finalityProviderMap.current.get(providerId);

          if (!bsn || !finalityProvider) return null;

          return { bsn, finalityProvider };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    },
    [bsnList],
  );

  const state = useMemo(
    () => ({
      filter,
      finalityProviders: filteredFinalityProviders,
      bsnList,
      bsnLoading,
      bsnError,
      hasNextPage,
      fetchNextPage,
      selectedBsnId,
      setSelectedBsnId,
      selectedProviderIds,
      setSelectedProviderIds,
      isFetching,
      hasError: isError,
      finalityProviderMap: finalityProviderMap.current,
      handleSort,
      handleFilter,
      isRowSelectable,
      getRegisteredFinalityProvider,
      getFinalityProviderName,
      getSelectedProviders,
      stakingModalPage,
      setStakingModalPage,
    }),
    [
      filter,
      filteredFinalityProviders,
      bsnList,
      bsnLoading,
      bsnError,
      hasNextPage,
      fetchNextPage,
      selectedBsnId,
      setSelectedBsnId,
      selectedProviderIds,
      setSelectedProviderIds,
      isFetching,
      isError,
      finalityProviderMap,
      handleSort,
      handleFilter,
      isRowSelectable,
      getRegisteredFinalityProvider,
      getFinalityProviderName,
      getSelectedProviders,
      stakingModalPage,
      setStakingModalPage,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useFpBsnState as useFinalityProviderBsnState };
export type { SelectedProvider };

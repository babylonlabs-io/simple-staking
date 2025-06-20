import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";

import { useSearchParams } from "@/ui/context/SearchParamsProvider";
import { useBsn } from "@/ui/hooks/client/api/useBsn";
import { useFinalityProviders } from "@/ui/hooks/client/api/useFinalityProviders";
import { useFinalityProvidersV2 } from "@/ui/hooks/client/api/useFinalityProvidersV2";
import { StakingModalPage } from "@/ui/state/StakingState";
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
  selectedBsnId: string | null;
  setSelectedBsnId: (id: string | null) => void;
  // Selected providers (from Multistaking form)
  selectedProviderIds: string[];
  setSelectedProviderIds: (ids: string[]) => void;
  disabledChainIds: string[];
  hasBabylonProviderFlag: boolean;
  bsnMap: Map<string, Bsn>;
  getFinalityProvidersBsns: (fps: FinalityProvider[]) => Bsn[];
  // selectedBsnId: string | null; // TODO: Uncomment when implementing BSN selection
  // Modal
  stakingModalPage: StakingModalPage;
  setStakingModalPage: (page: StakingModalPage) => void;
  handleSort: (sortField: string) => void;
  handleFilter: (key: keyof FilterState, value: string) => void;
  isRowSelectable: (row: FinalityProvider) => boolean;
  getRegisteredFinalityProvider: (btcPkHex: string) => FinalityProvider | null;
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
  selectedBsnId: null,
  setSelectedBsnId: () => {},
  selectedProviderIds: [],
  setSelectedProviderIds: () => {},
  disabledChainIds: [],
  hasBabylonProviderFlag: false,
  bsnMap: new Map(),
  getFinalityProvidersBsns: () => [],
  isRowSelectable: () => false,
  handleSort: () => {},
  handleFilter: () => {},
  getRegisteredFinalityProvider: () => null,
  getFinalityProviderName: () => undefined,
  finalityProviderMap: new Map(),
  stakingModalPage: StakingModalPage.DEFAULT,
  setStakingModalPage: () => {},
};

const { StateProvider, useState: useFpBsnState } =
  createStateUtils<FinalityProviderBsnState>(defaultState);

export function FinalityProviderBsnState({ children }: PropsWithChildren) {
  const params = useSearchParams();
  const { connected: isConnected } = useWalletConnect();
  const fpParam = params.get("fp");
  const [stakingModalPage, setStakingModalPage] = useState<StakingModalPage>(
    StakingModalPage.DEFAULT,
  );

  const [filter, setFilter] = useState<FilterState>({
    search: fpParam || "",
    status: "active",
  });
  const [sortState, setSortState] = useState<SortState>({});
  const debouncedSearch = useDebounce(filter.search, 300);

  const [selectedBsnId, setSelectedBsnId] = useState<string | null>(null);
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);

  const { data, isFetching, isError, hasNextPage, fetchNextPage } =
    useFinalityProvidersV2({
      sortBy: sortState.field,
      order: sortState.direction,
      name: debouncedSearch,
      bsnId: selectedBsnId === "" ? undefined : selectedBsnId?.toString(),
    });

  const { data: dataV1 } = useFinalityProviders();
  const {
    data: bsnList = [],
    isLoading: bsnLoading,
    isError: bsnError,
  } = useBsn({
    enabled: isConnected,
  });

  const bsnMap = useMemo(
    () =>
      bsnList.reduce((acc, bsn) => {
        // Note: empty BSN ID corresponds to babylon network
        acc.set(bsn.id, bsn);
        return acc;
      }, new Map<string, Bsn>()),
    [bsnList],
  );

  const finalityProviders = useMemo(() => {
    if (!data?.finalityProviders) return [];

    const filteredByBsn = (data.finalityProviders ?? []).filter((fp) => {
      if (selectedBsnId === null || selectedBsnId === undefined) return true;

      if (selectedBsnId === "") {
        return (fp.bsnId ?? "") === "";
      }

      return fp.bsnId === selectedBsnId;
    });

    return filteredByBsn
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
  }, [data?.finalityProviders, selectedBsnId]);

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

  const hasBabylonProviderFlag = useMemo(
    () =>
      selectedProviderIds.some((pk) => {
        const fp = getRegisteredFinalityProvider(pk);
        return !fp?.bsnId;
      }),
    [selectedProviderIds, getRegisteredFinalityProvider],
  );

  const disabledChainIds = useMemo(() => {
    const set = new Set<string>();
    selectedProviderIds.forEach((pk) => {
      const fp = getRegisteredFinalityProvider(pk);
      set.add(fp?.bsnId || "");
    });
    return Array.from(set);
  }, [selectedProviderIds, getRegisteredFinalityProvider]);

  const getFinalityProvidersBsns = useCallback(
    (fps: FinalityProvider[]) => {
      const bsnIds = new Set<string>();
      fps.forEach((fp) => {
        if (fp.bsnId) {
          bsnIds.add(fp.bsnId);
        }
      });
      return Array.from(bsnIds)
        .map((id) => bsnMap.get(id))
        .filter(Boolean) as Bsn[];
    },
    [bsnMap],
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
      // selectedBsnId: null, // TODO: Uncomment when implementing BSN selection
      bsnMap,
      getFinalityProvidersBsns: getFinalityProvidersBsns,
      isFetching,
      hasError: isError,
      finalityProviderMap,
      handleSort,
      handleFilter,
      isRowSelectable,
      getRegisteredFinalityProvider,
      getFinalityProviderName,
      stakingModalPage,
      setStakingModalPage,
      hasBabylonProviderFlag,
      disabledChainIds,
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
      bsnMap,
      getFinalityProvidersBsns,
      isFetching,
      isError,
      finalityProviderMap,
      handleSort,
      handleFilter,
      isRowSelectable,
      getRegisteredFinalityProvider,
      getFinalityProviderName,
      stakingModalPage,
      setStakingModalPage,
      hasBabylonProviderFlag,
      disabledChainIds,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useFpBsnState as useFinalityProviderBsnState };

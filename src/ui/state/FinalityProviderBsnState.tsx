import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";

import { chainLogos } from "@/ui/constants";
import { useSearchParams } from "@/ui/context/SearchParamsProvider";
import { useBsn } from "@/ui/hooks/client/api/useBsn";
import { useFinalityProviders } from "@/ui/hooks/client/api/useFinalityProviders";
import { useFinalityProvidersV2 } from "@/ui/hooks/client/api/useFinalityProvidersV2";
import { useLogger } from "@/ui/hooks/useLogger";
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

interface BsnNetworkInfo {
  name: string;
  icon: string;
}

interface FinalityProviderBsnState {
  // Search state
  filter: FilterState;

  // Finality providers
  finalityProviders: FinalityProvider[];
  isFetchingFinalityProvider: boolean;
  finalityProviderHasError: boolean;
  finalityProviderHasNextPage: boolean;
  finalityProviderFetchNextPage: () => void;

  // BSN
  bsn: Bsn[];
  bsnIsLoading: boolean;
  bsnHasError: boolean;

  // Selected BSN
  selectedBsnId: string | null;
  setSelectedBsnId: (id: string | null) => void;
  selectedBsnIds: Set<string>;
  setSelectedBsnIds: (ids: Set<string>) => void;
  hasBabylonFinalityProviderSelected: boolean;

  // Selected Finality Providers
  selectedFinalityProviderIds: Set<string>;
  setSelectedFinalityProviderIds: (ids: Set<string>) => void;

  // Legacy array-based interface for compatibility
  selectedProviderIds: string[];
  setSelectedProviderIds: (ids: string[]) => void;

  // BSN state

  // Modal state
  stakingModalPage: StakingModalPage;
  setStakingModalPage: (page: StakingModalPage) => void;
  handleSort: (sortField: string) => void;
  handleFilter: (key: keyof FilterState, value: string) => void;
  isRowSelectable: (row: FinalityProvider) => boolean;

  // Getter methods
  getFinalityProviderInfo: (fpId: string) => FinalityProvider | null;
  getFinalityProviderName: (btcPkHex: string) => string | undefined;
  getBsnNetworkInfo: (bsnId: string) => BsnNetworkInfo | null;
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
  isFetchingFinalityProvider: false,
  finalityProviderHasError: false,
  finalityProviderHasNextPage: false,
  finalityProviderFetchNextPage: () => {},
  bsn: [],
  bsnIsLoading: false,
  bsnHasError: false,
  selectedBsnId: null,
  setSelectedBsnId: () => {},
  selectedFinalityProviderIds: new Set(),
  setSelectedFinalityProviderIds: () => {},
  selectedProviderIds: [],
  setSelectedProviderIds: () => {},
  selectedBsnIds: new Set(),
  setSelectedBsnIds: () => {},
  hasBabylonFinalityProviderSelected: false,
  isRowSelectable: () => false,
  handleSort: () => {},
  handleFilter: () => {},
  getFinalityProviderInfo: () => null,
  getFinalityProviderName: () => undefined,
  stakingModalPage: StakingModalPage.DEFAULT,
  setStakingModalPage: () => {},
  getBsnNetworkInfo: () => null,
};

const { StateProvider, useState: useFpBsnState } =
  createStateUtils<FinalityProviderBsnState>(defaultState);

export function FinalityProviderBsnState({ children }: PropsWithChildren) {
  const params = useSearchParams();
  const fpParam = params.get("fp");
  const logger = useLogger();

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
  const [selectedBsnIds, setSelectedBsnIds] = useState<Set<string>>(new Set());
  const [selectedFinalityProviderIds, setSelectedFinalityProviderIds] =
    useState<Set<string>>(new Set());
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);

  const handleSetSelectedBsnId = useCallback(
    (id: string | null) => {
      logger.info("BSN selected", {
        bsnId: id ?? "null",
        isBabylonGenesis: id === "",
      });
      setSelectedBsnId(id);
    },
    [logger],
  );

  const handleSetSelectedBsnIds = useCallback((ids: Set<string>) => {
    setSelectedBsnIds(ids);
  }, []);

  const handleSetSelectedFinalityProviderIds = useCallback(
    (ids: Set<string>) => {
      setSelectedFinalityProviderIds(ids);
    },
    [],
  );

  // Fix: Properly handle empty string BSN ID for Babylon Genesis
  // When selectedBsnId is "", we should pass it to the API, not undefined
  const selectedBsnIdForApi = useMemo(() => {
    if (selectedBsnId === null || selectedBsnId === undefined) {
      return undefined;
    }
    // For Babylon Genesis (empty string), we want to explicitly filter by empty string
    return selectedBsnId;
  }, [selectedBsnId]);

  // Determine when to enable the finality providers query
  const shouldEnableQuery =
    stakingModalPage === StakingModalPage.CHAIN_SELECTION ||
    selectedBsnId !== null;

  const {
    data,
    isFetching: isFetchingFinalityProvider,
    isError: finalityProviderHasError,
    hasNextPage: finalityProviderHasNextPage,
    fetchNextPage: finalityProviderFetchNextPage,
  } = useFinalityProvidersV2({
    sortBy: sortState.field,
    order: sortState.direction,
    name: debouncedSearch,
    bsnId: selectedBsnIdForApi,
    enabled: shouldEnableQuery,
  });

  const { data: dataV1 } = useFinalityProviders();
  const {
    data: bsnList = [],
    isLoading: bsnLoading,
    isError: bsnError,
  } = useBsn({
    enabled: stakingModalPage === StakingModalPage.CHAIN_SELECTION,
  });

  const [allFinalityProviders, setAllFinalityProviders] = useState<
    Map<string, FinalityProvider>
  >(new Map());

  // Add newly fetched providers to the accumulated map
  useMemo(() => {
    if (!data?.finalityProviders) {
      return;
    }

    setAllFinalityProviders((prevMap) => {
      const newMap = new Map(prevMap);

      data.finalityProviders.forEach((fp, i) => {
        const provider = {
          ...fp,
          rank: i + 1,
          id: fp.btcPk,
        };
        newMap.set(fp.btcPk, provider);
      });

      return newMap;
    });
  }, [data?.finalityProviders]);

  // Sorted and filtered list for display
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
    (btcPkHex: string) => {
      const fp =
        finalityProviders.find((fp) => fp.btcPk === btcPkHex) ??
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
    [finalityProviders, providersV1Map, bsnList],
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

  const getFinalityProviderInfo = useCallback(
    (fpId: string): FinalityProvider | null => {
      return allFinalityProviders.get(fpId) || null;
    },
    [allFinalityProviders],
  );

  const getBsnNetworkInfo = useCallback(
    (bsnId: string): BsnNetworkInfo | null => {
      // Check for Babylon Genesis (empty string BSN ID)
      if (bsnId === "") {
        return {
          name: "Babylon Genesis",
          icon: chainLogos.babylon,
        };
      }

      // Check for undefined/null BSN ID (regular Babylon providers)
      if (bsnId === undefined || bsnId === null) {
        return {
          name: "Babylon",
          icon: chainLogos.babylon,
        };
      }

      // Check for other BSN IDs
      if (bsnId && bsnId !== "") {
        const bsn = bsnList.find((b) => b.id === bsnId);
        const bsnName = bsn?.name || "Unknown BSN";

        // Map BSN IDs to appropriate chain logos
        const getChainIcon = (bsnId: string) => {
          if (bsnId.includes("cosmos")) return chainLogos.cosmos;
          if (bsnId.includes("ethereum")) return chainLogos.ethereum;
          if (bsnId.includes("sui")) return chainLogos.sui;
          return chainLogos.placeholder;
        };

        return {
          name: bsnName,
          icon: getChainIcon(bsnId),
        };
      }

      return null;
    },
    [bsnList],
  );

  // Update selectedBsnIds based on selected finality providers
  useMemo(() => {
    const newSelectedBsnIds = new Set<string>();

    Array.from(selectedFinalityProviderIds).forEach((fpId) => {
      const fp = getFinalityProviderInfo(fpId);
      if (fp) {
        const bsnId =
          fp.bsnId === undefined || fp.bsnId === null ? "" : fp.bsnId;
        newSelectedBsnIds.add(bsnId);
      }
    });

    // Only update if the set has changed
    if (
      newSelectedBsnIds.size !== selectedBsnIds.size ||
      !Array.from(newSelectedBsnIds).every((id) => selectedBsnIds.has(id))
    ) {
      setSelectedBsnIds(newSelectedBsnIds);
    }
  }, [selectedFinalityProviderIds, getFinalityProviderInfo, selectedBsnIds]);

  // Check if user has selected a Babylon finality provider
  const hasBabylonFinalityProviderSelected = useMemo(() => {
    return selectedBsnIds.has("");
  }, [selectedBsnIds]);

  const state = useMemo(
    () => ({
      filter,
      finalityProviders: filteredFinalityProviders,
      isFetchingFinalityProvider,
      finalityProviderHasError,
      finalityProviderHasNextPage,
      finalityProviderFetchNextPage,
      bsn: bsnList,
      bsnIsLoading: bsnLoading,
      bsnHasError: bsnError,
      selectedBsnId,
      setSelectedBsnId: handleSetSelectedBsnId,
      selectedFinalityProviderIds,
      setSelectedFinalityProviderIds: handleSetSelectedFinalityProviderIds,
      selectedProviderIds,
      setSelectedProviderIds,
      selectedBsnIds,
      setSelectedBsnIds: handleSetSelectedBsnIds,
      hasBabylonFinalityProviderSelected,
      stakingModalPage,
      setStakingModalPage,
      handleSort,
      handleFilter,
      isRowSelectable,
      getFinalityProviderInfo,
      getFinalityProviderName,
      getBsnNetworkInfo,
    }),
    [
      filter,
      filteredFinalityProviders,
      bsnList,
      bsnLoading,
      bsnError,
      finalityProviderHasNextPage,
      finalityProviderFetchNextPage,
      selectedBsnId,
      handleSetSelectedBsnId,
      selectedFinalityProviderIds,
      handleSetSelectedFinalityProviderIds,
      selectedProviderIds,
      setSelectedProviderIds,
      isFetchingFinalityProvider,
      finalityProviderHasError,
      handleSort,
      handleFilter,
      isRowSelectable,
      getFinalityProviderInfo,
      getFinalityProviderName,
      stakingModalPage,
      setStakingModalPage,
      selectedBsnIds,
      handleSetSelectedBsnIds,
      hasBabylonFinalityProviderSelected,
      getBsnNetworkInfo,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useFpBsnState as useFinalityProviderBsnState };

import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { useSearchParams } from "react-router";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useBsn } from "@/ui/common/hooks/client/api/useBsn";
import { useFinalityProvidersV2 } from "@/ui/common/hooks/client/api/useFinalityProvidersV2";
import { Bsn } from "@/ui/common/types/bsn";
import {
  FinalityProviderState as FinalityProviderStateEnum,
  type FinalityProvider,
} from "@/ui/common/types/finalityProviders";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

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

const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();

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
  stakingModalPage: StakingModalPage.DEFAULT,
  setStakingModalPage: () => {},
};

const { StateProvider, useState: useFpBsnState } =
  createStateUtils<FinalityProviderBsnState>(defaultState);

export function FinalityProviderBsnState({ children }: PropsWithChildren) {
  const [params] = useSearchParams();
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

  const [selectedBsnId, setSelectedBsnId] = useState<string | undefined>(
    BBN_CHAIN_ID,
  );
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);

  const { data, isFetching, isError, hasNextPage, fetchNextPage } =
    useFinalityProvidersV2({
      sortBy: sortState.field,
      order: sortState.direction,
      name: debouncedSearch,
      // TODO: Temporary solution until the backend is able to handle query FP by Babylon bsnId
      bsnId: selectedBsnId === BBN_CHAIN_ID ? undefined : selectedBsnId,
      enabled: stakingModalPage === StakingModalPage.FINALITY_PROVIDER,
    });

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
      handleSort,
      handleFilter,
      isRowSelectable,
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
      handleSort,
      handleFilter,
      isRowSelectable,
      stakingModalPage,
      setStakingModalPage,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useFpBsnState as useFinalityProviderBsnState };

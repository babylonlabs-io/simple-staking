import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { useSearchParams } from "react-router";

import { BSN_TYPE_COSMOS } from "@/ui/common/api/getBsn";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useBsn } from "@/ui/common/hooks/client/api/useBsn";
import { useFinalityProvidersV2 } from "@/ui/common/hooks/client/api/useFinalityProvidersV2";
import {
  getBsnConfig,
  type BsnFilterOption,
} from "@/ui/common/services/bsnService";
import {
  filterFinalityProvidersByBsn,
  isFinalityProviderRowSelectable,
  type FinalityProviderFilterState,
} from "@/ui/common/services/finalityProviderFilterService";
import { Bsn } from "@/ui/common/types/bsn";
import {
  FinalityProviderState as FinalityProviderStateEnum,
  type FinalityProvider,
} from "@/ui/common/types/finalityProviders";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

import { getBsnLogoUrl } from "../utils/bsnLogo";

interface SortState {
  field?: string;
  direction?: "asc" | "desc";
}

type FilterState = FinalityProviderFilterState;

const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();

const defaultBabylonBsn: Bsn = {
  id: BBN_CHAIN_ID,
  name: "Babylon Genesis",
  description: "Babylon Genesis",
  logoUrl: getBsnLogoUrl(BBN_CHAIN_ID),
  type: BSN_TYPE_COSMOS,
};

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
  // selectedBsn contains allowlist and type data needed for filtering logic
  // Cannot be derived from selectedBsnId alone as it requires the full BSN object
  selectedBsn: Bsn | undefined;
  setSelectedBsnId: (id: string | undefined) => void;
  // BSN Configuration (moved from components to state)
  modalTitle: string;
  filterOptions: BsnFilterOption[];
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

// Component-specific constants remain in the state file

const FILTERS = {
  searchTerm: (fp: FinalityProvider, filter: FilterState) => {
    const searchTerm = filter.searchTerm.toLowerCase();
    return (
      (fp.description?.moniker?.toLowerCase().includes(searchTerm) ?? false) ||
      fp.btcPk.toLowerCase().includes(searchTerm)
    );
  },
};

const defaultState: FinalityProviderBsnState = {
  filter: {
    searchTerm: "",
    providerStatus: "active",
    allowlistStatus: "",
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
  selectedBsn: undefined,
  setSelectedBsnId: () => {},
  // Default BSN configuration (Babylon Genesis)
  modalTitle: "Select Babylon Genesis Finality Provider",
  filterOptions: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "jailed", label: "Jailed" },
    { value: "slashed", label: "Slashed" },
  ],
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
    searchTerm: fpParam || "",
    providerStatus: "active",
    allowlistStatus: "",
  });
  const [sortState, setSortState] = useState<SortState>({});
  const debouncedSearch = useDebounce(filter.searchTerm, 300);

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
    data: bsnList = [defaultBabylonBsn],
    isLoading: bsnLoading,
    isError: bsnError,
  } = useBsn({
    enabled: stakingModalPage === StakingModalPage.BSN,
  });

  const selectedBsn = useMemo(
    () => bsnList.find((bsn) => bsn.id === selectedBsnId),
    [bsnList, selectedBsnId],
  );

  // BSN configuration derived from selected BSN (moved from components)
  const bsnConfig = useMemo(() => getBsnConfig(selectedBsn), [selectedBsn]);

  const modalTitle = useMemo(
    () => bsnConfig.modalTitle,
    [bsnConfig.modalTitle],
  );
  const filterOptions = useMemo(
    () => bsnConfig.filterOptions,
    [bsnConfig.filterOptions],
  );

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

  const isRowSelectable = useCallback(
    (row: FinalityProvider) =>
      isFinalityProviderRowSelectable(row, selectedBsnId, selectedBsn),
    [selectedBsnId, selectedBsn],
  );

  const filteredFinalityProviders = useMemo(() => {
    // First apply search filter
    const filtered = finalityProviders.filter((fp: FinalityProvider) =>
      FILTERS.searchTerm(fp, filter),
    );

    // If search is active, return all matching results without status filtering
    if (filter.searchTerm) {
      return filtered;
    }

    return filterFinalityProvidersByBsn(filtered, filter, selectedBsn);
  }, [finalityProviders, filter, selectedBsn]);

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
      selectedBsn,
      setSelectedBsnId,
      selectedProviderIds,
      setSelectedProviderIds,
      isFetching,
      hasError: isError,
      // BSN Configuration (moved from components to state)
      modalTitle,
      filterOptions,
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
      selectedBsn,
      setSelectedBsnId,
      selectedProviderIds,
      setSelectedProviderIds,
      isFetching,
      isError,
      modalTitle,
      filterOptions,
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

import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { useSearchParams } from "react-router";

import { BSN_TYPE_COSMOS, getBsnConfig } from "@/ui/common/api/getBsn";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useBsn } from "@/ui/common/hooks/client/api/useBsn";
import { useFinalityProvidersV2 } from "@/ui/common/hooks/client/api/useFinalityProvidersV2";
import { Bsn } from "@/ui/common/types/bsn";
import {
  FinalityProviderState as FinalityProviderStateEnum,
  type FinalityProvider,
} from "@/ui/common/types/finalityProviders";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

import { getBsnLogoUrl } from "../utils/bsnLogo";

const normalizeHex = (hex?: string): string =>
  (hex ?? "").trim().toLowerCase().replace(/^0x/, "");

interface SortState {
  field?: string;
  direction?: "asc" | "desc";
}

interface FilterState {
  searchTerm: string;
  providerStatus: "active" | "inactive" | "";
  allowlistStatus: "allowlisted" | "not-allowlisted" | "";
}

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
  selectedBsn: Bsn | undefined;
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
    fp.state === FinalityProviderStateEnum.INACTIVE,
  jailed: (fp: FinalityProvider) =>
    fp.state === FinalityProviderStateEnum.JAILED,
  slashed: (fp: FinalityProvider) =>
    fp.state === FinalityProviderStateEnum.SLASHED,
};

const createAllowlistFilters = (selectedBsn: Bsn | undefined) => {
  const allowSet = new Set((selectedBsn?.allowlist || []).map(normalizeHex));

  return {
    allowlisted: (fp: FinalityProvider) => allowSet.has(normalizeHex(fp.btcPk)),
    "not-allowlisted": (fp: FinalityProvider) =>
      !allowSet.has(normalizeHex(fp.btcPk)),
  };
};

const filterFinalityProvidersByBsn = (
  providers: FinalityProvider[],
  filter: FilterState,
  selectedBsn: Bsn | undefined,
): FinalityProvider[] => {
  let filtered = providers;

  // Apply BSN-aware filtering based on provider status
  if (filter.providerStatus) {
    const bsnConfig = getBsnConfig(selectedBsn);
    if (bsnConfig.fpFilterBehavior === "allowlist-based") {
      // For rollup BSNs: filter all FPs by allowlist (regardless of active/inactive state)
      const allowSet = new Set(
        (selectedBsn?.allowlist || []).map(normalizeHex),
      );

      filtered = filtered.filter((fp) => {
        const isAllowlisted = allowSet.has(normalizeHex(fp.btcPk));

        if (filter.providerStatus === "active") {
          return isAllowlisted;
        } else {
          return !isAllowlisted;
        }
      });
    } else if (bsnConfig.fpFilterBehavior === "status-based") {
      // For status-based BSNs: filter by finality provider state (active/inactive/jailed/slashed)
      const statusFilter =
        STATUS_FILTERS[filter.providerStatus as keyof typeof STATUS_FILTERS];
      if (statusFilter) {
        filtered = filtered.filter(statusFilter);
      }
    }
  }

  if (filter.allowlistStatus) {
    const allowlistFilters = createAllowlistFilters(selectedBsn);
    const allowlistFilter =
      allowlistFilters[filter.allowlistStatus as keyof typeof allowlistFilters];
    if (allowlistFilter) {
      filtered = filtered.filter(allowlistFilter);
    }
  }

  return filtered;
};

const FILTERS = {
  searchTerm: (fp: FinalityProvider, filter: FilterState) => {
    const searchTerm = filter.searchTerm.toLowerCase();
    return (
      (fp.description?.moniker?.toLowerCase().includes(searchTerm) ?? false) ||
      fp.btcPk.toLowerCase().includes(searchTerm)
    );
  },
  providerStatus: (fp: FinalityProvider, filter: FilterState) =>
    filter.providerStatus && !filter.searchTerm
      ? STATUS_FILTERS[filter.providerStatus](fp)
      : true,
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
    (row: FinalityProvider) => {
      const statusAllowed =
        row.state === FinalityProviderStateEnum.ACTIVE ||
        row.state === FinalityProviderStateEnum.INACTIVE;

      // For selection (not filtering), only restrict based on allowlist for non-Babylon BSNs
      const allowlistAllowed =
        !selectedBsnId ||
        selectedBsnId === BBN_CHAIN_ID ||
        (selectedBsn?.allowlist || []).some(
          (allowedPk) => normalizeHex(allowedPk) === normalizeHex(row.btcPk),
        );

      return statusAllowed && allowlistAllowed;
    },
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

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

import { useError } from "@/app/context/Error/ErrorContext";
import { useFinalityProviders } from "@/app/hooks/client/api/useFinalityProviders";
import { ErrorState } from "@/app/types/errors";
import {
  FinalityProviderState as FinalityProviderStateEnum,
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
  selectedFinalityProvider: FinalityProvider | null;
  hasNextPage: boolean;
  isFetching: boolean;
  hasError: boolean;
  handleSearch: (searchTerm: string) => void;
  handleSort: (sortField: string) => void;
  handleFilter: (value: string | number) => void;
  handleRowSelect: (row: FinalityProvider | null) => void;
  isRowSelectable: (row: FinalityProvider) => boolean;
  getFinalityProviderMoniker: (btcPkHex: string) => string;
  fetchNextPage: () => void;
}

const defaultState: FinalityProviderState = {
  searchValue: "",
  filterValue: "",
  finalityProviders: [],
  selectedFinalityProvider: null,
  hasNextPage: false,
  isFetching: false,
  hasError: false,
  isRowSelectable: () => false,
  handleSearch: () => {},
  handleSort: () => {},
  handleFilter: () => {},
  handleRowSelect: () => {},
  getFinalityProviderMoniker: () => "-",
  fetchNextPage: () => {},
};

const { StateProvider, useState: useFpState } =
  createStateUtils<FinalityProviderState>(defaultState);

function FinalityProviderStateInner({ children }: PropsWithChildren) {
  const searchParams = useSearchParams();
  const fpParam = searchParams.get("fp");

  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState<string | number>(
    fpParam ? "" : "active",
  );
  const [sortState, setSortState] = useState<SortState>({});
  const [selectedFinalityProvider, setSelectedFinalityProvider] =
    useState<FinalityProvider | null>(null);
  const { showError, captureError } = useError();

  const debouncedSearch = useDebounce(searchValue, 300);

  const { data, hasNextPage, fetchNextPage, isFetching, isError, error } =
    useFinalityProviders({
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

  const handleRowSelect = useCallback((row: FinalityProvider | null) => {
    setSelectedFinalityProvider(row);
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

  const getFinalityProviderMoniker = useCallback(
    (btcPkHex: string) => {
      const moniker = filteredFinalityProviders.find(
        (fp) => fp.btcPk === btcPkHex,
      )?.description?.moniker;

      if (!moniker) {
        return "-";
      }
      return moniker;
    },
    [filteredFinalityProviders],
  );

  useEffect(() => {
    if (fpParam && data?.finalityProviders) {
      handleSearch(fpParam);
    }
  }, [fpParam, data?.finalityProviders, handleSearch]);

  useEffect(() => {
    if (isError && error) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.SERVER_ERROR,
        },
        retryAction: fetchNextPage,
      });
      captureError(error);
    }
  }, [isError, error, showError, captureError, fetchNextPage]);

  const state = {
    searchValue,
    filterValue,
    finalityProviders: filteredFinalityProviders,
    selectedFinalityProvider,
    isFetching,
    hasNextPage,
    hasError: isError,
    handleSearch,
    handleSort,
    handleFilter,
    handleRowSelect,
    isRowSelectable,
    getFinalityProviderMoniker,
    fetchNextPage,
  };

  return <StateProvider value={state}>{children}</StateProvider>;
}

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

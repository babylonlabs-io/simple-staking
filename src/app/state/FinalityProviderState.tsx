import { useDebounce } from "@uidotdev/usehooks";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { useFinalityProviders } from "@/app/hooks/client/api/useFinalityProviders";
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
  hasNextPage: boolean;
  isFetching: boolean;
  hasError: boolean;
  handleSearch: (searchTerm: string) => void;
  handleSort: (sortField: string) => void;
  handleFilter: (value: string | number) => void;
  isRowSelectable: (row: FinalityProvider) => boolean;
  getFinalityProvider: (btcPkHex: string) => FinalityProvider | null;
  fetchNextPage: () => void;
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
};

const { StateProvider, useState: useFpState } =
  createStateUtils<FinalityProviderState>(defaultState);

function FinalityProviderStateInner({ children }: PropsWithChildren) {
  const searchParams = useSearchParams();
  const fpParam = searchParams.get("fp");

  const [searchValue, setSearchValue] = useState(fpParam || "");
  const [filterValue, setFilterValue] = useState<string | number>(
    fpParam ? "" : "active",
  );
  const [sortState, setSortState] = useState<SortState>({});
  const [previousFilterValue, setPreviousFilterValue] = useState<
    string | number
  >("active");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const debouncedSearch = useDebounce(searchValue, 300);

  const { data, hasNextPage, fetchNextPage, isFetching, isError } =
    useFinalityProviders({
      sortBy: sortState.field,
      order: sortState.direction,
      name: debouncedSearch,
    });

  const handleSearch = useCallback(
    (searchTerm: string) => {
      if (!searchValue && searchTerm) {
        setPreviousFilterValue(filterValue);
      }

      setSearchValue(searchTerm);

      if (!(isInitialLoad && fpParam && searchTerm === fpParam)) {
        if (searchTerm) {
          setFilterValue("");
        } else {
          setFilterValue(previousFilterValue);
        }
      } else {
        setIsInitialLoad(false);
      }
    },
    [searchValue, filterValue, previousFilterValue, isInitialLoad, fpParam],
  );

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
    setPreviousFilterValue(value);
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
    });
  }, [data?.finalityProviders, filterValue, searchValue]);

  const getFinalityProvider = useCallback(
    (btcPkHex: string) =>
      data?.finalityProviders.find((fp) => fp.btcPk === btcPkHex) || null,
    [data?.finalityProviders],
  );

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
    ],
  );

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

import { type PropsWithChildren } from "react";

import { useFinalityProviderServiceState } from "@/app/hooks/services/useFinalityProviderService";
import type { FinalityProvider } from "@/app/types/finalityProviders";
import { createStateUtils } from "@/utils/createStateUtils";

interface FinalityProviderServiceState {
  searchValue: string;
  filterValue: string | number;
  finalityProviders: FinalityProvider[];
  selectedFinalityProvider: FinalityProvider | null;
  hasNextPage: boolean;
  isFetching: boolean;
  handleSearch: (searchTerm: string) => void;
  handleSort: (sortField: string) => void;
  handleFilter: (value: string | number) => void;
  handleRowSelect: (row: FinalityProvider) => void;
  getFinalityProviderMoniker: (btcPkHex: string) => string;
  fetchNextPage: () => void;
  hasError: boolean;
}

const { StateProvider, useState: useFinalityProviderService } =
  createStateUtils<FinalityProviderServiceState>({
    searchValue: "",
    filterValue: "active",
    finalityProviders: [],
    selectedFinalityProvider: null,
    hasNextPage: false,
    isFetching: false,
    handleSearch: () => {},
    handleSort: () => {},
    handleFilter: () => {},
    handleRowSelect: () => {},
    getFinalityProviderMoniker: () => "-",
    fetchNextPage: () => {},
    hasError: false,
  });

export function FinalityProviderServiceState({ children }: PropsWithChildren) {
  const state = useFinalityProviderServiceState();
  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useFinalityProviderService };

import { useCallback, useMemo, type PropsWithChildren } from "react";

import { useFinalityProviders } from "@/app/hooks/client/api/useFinalityProviders";
import { type FinalityProvider } from "@/app/types/finalityProviders";
import { createStateUtils } from "@/utils/createStateUtils";

interface FinalityProviderState {
  finalityProviders: FinalityProvider[];
  hasNextPage: boolean;
  isFetching: boolean;
  hasError: boolean;
  getFinalityProvider: (btcPkHex: string) => FinalityProvider | null;
  fetchNextPage: () => void;
}

const defaultState: FinalityProviderState = {
  finalityProviders: [],
  hasNextPage: false,
  isFetching: false,
  hasError: false,
  getFinalityProvider: () => null,
  fetchNextPage: () => {},
};

const { StateProvider, useState: useFpState } =
  createStateUtils<FinalityProviderState>(defaultState);

export function FinalityProviderState({ children }: PropsWithChildren) {
  const { data, hasNextPage, fetchNextPage, isFetching, isError } =
    useFinalityProviders({});

  const getFinalityProvider = useCallback(
    (btcPkHex: string) =>
      data?.finalityProviders.find((fp) => fp.btcPk === btcPkHex) || null,
    [data?.finalityProviders],
  );

  const state = useMemo(
    () => ({
      finalityProviders: data?.finalityProviders || [],
      hasNextPage,
      isFetching,
      hasError: isError,
      getFinalityProvider,
      fetchNextPage,
    }),
    [
      data?.finalityProviders,
      hasNextPage,
      isFetching,
      isError,
      getFinalityProvider,
      fetchNextPage,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useFpState as useFinalityProviderState };

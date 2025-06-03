import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { useInscriptionProvider } from "@babylonlabs-io/wallet-connector";
import { useTheme } from "next-themes";
import { useCallback, useMemo, type PropsWithChildren } from "react";

import { useUTXOs } from "@/app/hooks/client/api/useUTXOs";
import { createStateUtils } from "@/utils/createStateUtils";
import { filterDust } from "@/utils/wallet";

import { useNetworkInfo } from "../hooks/client/api/useNetworkInfo";
import { NetworkInfo } from "../types/networkInfo";

import { BalanceState } from "./BalanceState";
import { DelegationState } from "./DelegationState";
import { DelegationV2State } from "./DelegationV2State";
import { FinalityProviderState } from "./FinalityProviderState";
import { RewardsState } from "./RewardState";
import { StakingState } from "./StakingState";

// The order of the states is important for the state provider
const STATE_LIST = [
  DelegationState,
  DelegationV2State,
  FinalityProviderState,
  BalanceState,
  StakingState,
  RewardsState,
];

const ordinalMap: any = {};

export interface AppState {
  theme?: string;
  availableUTXOs?: UTXO[];
  allUTXOs?: UTXO[];
  inscriptionsUTXOs?: UTXO[];
  networkInfo?: NetworkInfo;
  isError: boolean;
  isLoading: boolean;
  ordinalsExcluded: boolean;
  includeOrdinals: () => void;
  excludeOrdinals: () => void;
  refetchUTXOs: () => void;
  setTheme: (theme: "dark" | "light") => void;
}

const { StateProvider, useState: useApplicationState } =
  createStateUtils<AppState>({
    theme: undefined,
    isLoading: false,
    isError: false,
    ordinalsExcluded: true,
    includeOrdinals: () => {},
    excludeOrdinals: () => {},
    refetchUTXOs: () => {},
    setTheme: () => {},
  });

export function AppState({ children }: PropsWithChildren) {
  const { theme, setTheme } = useTheme();

  const { lockInscriptions: ordinalsExcluded, toggleLockInscriptions } =
    useInscriptionProvider();

  // States
  const {
    allUTXOs = [],
    confirmedUTXOs = [],
    isLoading: isUTXOLoading,
    isError: isUTXOError,
    refetch: refetchUTXOs,
  } = useUTXOs();
  const {
    data: ordinals = [],
    isLoading: isOrdinalLoading,
    isError: isOrdinalError,
  } = {
    data: [],
    isLoading: false,
    isError: false,
  };
  const {
    data: networkInfo,
    isLoading: isNetworkInfoLoading,
    isError: isNetworkInfoError,
  } = useNetworkInfo();

  // Computed
  const isLoading = isUTXOLoading || isOrdinalLoading || isNetworkInfoLoading;
  const isError = isUTXOError || isOrdinalError || isNetworkInfoError;

  // const ordinalMap: Record<string, InscriptionIdentifier> = useMemo(
  //   () =>
  //     ordinals.reduce(
  //       (acc, ordinal) => ({ ...acc, [ordinal.txid]: ordinal }),
  //       {},
  //     ),
  //   [ordinals],
  // );

  const inscriptionsUTXOs = useMemo(() => {
    return confirmedUTXOs.filter((utxo) => ordinalMap[utxo.txid]);
  }, [confirmedUTXOs]);

  const availableUTXOs = useMemo(() => {
    if (isLoading) return [];

    return ordinalsExcluded
      ? filterDust(confirmedUTXOs).filter((utxo) => !ordinalMap[utxo.txid])
      : confirmedUTXOs;
  }, [isLoading, ordinalsExcluded, confirmedUTXOs]);

  // Handlers
  const includeOrdinals = useCallback(
    () => toggleLockInscriptions?.(false),
    [toggleLockInscriptions],
  );
  const excludeOrdinals = useCallback(
    () => toggleLockInscriptions?.(true),
    [toggleLockInscriptions],
  );

  // Context
  const context = useMemo(
    () => ({
      theme,
      allUTXOs,
      availableUTXOs,
      inscriptionsUTXOs,
      networkInfo,
      isError,
      isLoading,
      ordinalsExcluded,
      includeOrdinals,
      excludeOrdinals,
      refetchUTXOs,
      setTheme,
    }),
    [
      theme,
      allUTXOs,
      availableUTXOs,
      inscriptionsUTXOs,
      networkInfo,
      isError,
      isLoading,
      ordinalsExcluded,
      includeOrdinals,
      excludeOrdinals,
      refetchUTXOs,
      setTheme,
    ],
  );

  const states = useMemo(
    () =>
      STATE_LIST.reduceRight(
        (children, State, index) => <State key={index}>{children}</State>,
        children,
      ),
    [children],
  );

  return <StateProvider value={context}>{states}</StateProvider>;
}

export const useAppState = useApplicationState;

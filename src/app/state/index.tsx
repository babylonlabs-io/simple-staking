import { useInscriptionProvider } from "@babylonlabs-io/bbn-wallet-connect";
import { useCallback, useMemo, type PropsWithChildren } from "react";

import { useBTCTipHeight } from "@/app/hooks/api/useBTCTipHeight";
import { useOrdinals } from "@/app/hooks/api/useOrdinals";
import { useUTXOs } from "@/app/hooks/api/useUTXOs";
import { createStateUtils } from "@/utils/createStateUtils";
import { filterDust } from "@/utils/wallet";
import type {
  InscriptionIdentifier,
  UTXO,
} from "@/utils/wallet/btc_wallet_provider";

import { useNetworkInfo } from "../hooks/api/useNetworkInfo";
import { NetworkInfo } from "../types/networkInfo";

import { DelegationState } from "./DelegationState";
import { DelegationV2State } from "./DelegationV2State";

const STATE_LIST = [DelegationState, DelegationV2State];

export interface AppState {
  availableUTXOs?: UTXO[];
  totalBalance: number;
  networkInfo?: NetworkInfo;
  currentHeight?: number;
  isError: boolean;
  isLoading: boolean;
  ordinalsExcluded: boolean;
  includeOrdinals: () => void;
  excludeOrdinals: () => void;
}

const { StateProvider, useState: useApplicationState } =
  createStateUtils<AppState>({
    isLoading: false,
    isError: false,
    totalBalance: 0,
    ordinalsExcluded: true,
    includeOrdinals: () => {},
    excludeOrdinals: () => {},
  });

export function AppState({ children }: PropsWithChildren) {
  const { lockInscriptions: ordinalsExcluded, toggleLockInscriptions } =
    useInscriptionProvider();

  // States
  const {
    data: utxos = [],
    isLoading: isUTXOLoading,
    isError: isUTXOError,
  } = useUTXOs();
  const {
    data: ordinals = [],
    isLoading: isOrdinalLoading,
    isError: isOrdinalError,
  } = useOrdinals(utxos, {
    enabled: !isUTXOLoading,
  });
  const {
    data: networkInfo,
    isLoading: isNetworkInfoLoading,
    isError: isNetworkInfoError,
  } = useNetworkInfo();

  const {
    data: height,
    isLoading: isHeightLoading,
    isError: isHeightError,
  } = useBTCTipHeight();

  // Computed
  const isLoading =
    isHeightLoading ||
    isUTXOLoading ||
    isOrdinalLoading ||
    isNetworkInfoLoading;
  const isError =
    isHeightError || isUTXOError || isOrdinalError || isNetworkInfoError;

  const ordinalMap: Record<string, InscriptionIdentifier> = useMemo(
    () =>
      ordinals.reduce(
        (acc, ordinal) => ({ ...acc, [ordinal.txid]: ordinal }),
        {},
      ),
    [ordinals],
  );

  const availableUTXOs = useMemo(() => {
    if (isLoading) return [];

    return ordinalsExcluded
      ? filterDust(utxos).filter((utxo) => !ordinalMap[utxo.txid])
      : utxos;
  }, [isLoading, ordinalsExcluded, utxos, ordinalMap]);

  const totalBalance = useMemo(
    () =>
      availableUTXOs.reduce((accumulator, item) => accumulator + item.value, 0),
    [availableUTXOs],
  );

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
      availableUTXOs,
      currentHeight: height,
      totalBalance,
      networkInfo,
      isError,
      isLoading,
      ordinalsExcluded,
      includeOrdinals,
      excludeOrdinals,
    }),
    [
      availableUTXOs,
      height,
      totalBalance,
      networkInfo,
      isError,
      isLoading,
      ordinalsExcluded,
      includeOrdinals,
      excludeOrdinals,
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

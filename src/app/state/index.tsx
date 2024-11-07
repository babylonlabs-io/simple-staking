import { useCallback, useMemo, useState, type PropsWithChildren } from "react";

import { useBTCTipHeight } from "@/app/hooks/api/useBTCTipHeight";
import { useOrdinals } from "@/app/hooks/api/useOrdinals";
import { useParams } from "@/app/hooks/api/useParams";
import { useUTXOs } from "@/app/hooks/api/useUTXOs";
import { useVersions } from "@/app/hooks/api/useVersions";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { createStateUtils } from "@/utils/createStateUtils";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { filterDust } from "@/utils/wallet";
import type {
  InscriptionIdentifier,
  UTXO,
} from "@/utils/wallet/btc_wallet_provider";

import { DelegationState } from "./DelegationState";

const STATE_LIST = [DelegationState];

export interface AppState {
  availableUTXOs?: UTXO[];
  totalBalance: number;
  nextVersion?: GlobalParamsVersion;
  currentVersion?: GlobalParamsVersion;
  currentHeight?: number;
  isApprochingNextVersion: boolean;
  firstActivationHeight: number;
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
    isApprochingNextVersion: false,
    firstActivationHeight: 0,
    ordinalsExcluded: true,
    includeOrdinals: () => {},
    excludeOrdinals: () => {},
  });

const defaultVersionParams = {
  isApprochingNextVersion: false,
  firstActivationHeight: 0,
  currentVersion: undefined,
  nextVersion: undefined,
};

export function AppState({ children }: PropsWithChildren) {
  const [ordinalsExcluded, setOrdinalsExcluded] = useState(true);

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
    data: versions,
    isLoading: isVersionLoading,
    isError: isVersionError,
  } = useVersions();

  const {
    data: params,
    isLoading: isParamsLoading,
    isError: isParamsError,
  } = useParams();

  const {
    data: height,
    isLoading: isHeightLoading,
    isError: isHeightError,
  } = useBTCTipHeight();

  // Computed
  const isLoading =
    isVersionLoading || isHeightLoading || isUTXOLoading || isOrdinalLoading;
  const isError =
    isHeightError || isVersionError || isUTXOError || isOrdinalError;

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

  const versionInfo = useMemo(
    () =>
      versions && height
        ? getCurrentGlobalParamsVersion(height + 1, versions)
        : defaultVersionParams,
    [versions, height],
  );

  // Handlers
  const includeOrdinals = useCallback(() => setOrdinalsExcluded(false), []);
  const excludeOrdinals = useCallback(() => setOrdinalsExcluded(true), []);

  // Context
  const context = useMemo(
    () => ({
      availableUTXOs,
      currentHeight: height,
      totalBalance,
      ...versionInfo,
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
      versionInfo,
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
        (children, State) => <State>{children}</State>,
        children,
      ),
    [children],
  );

  return <StateProvider value={context}>{states}</StateProvider>;
}

export const useAppState = useApplicationState;

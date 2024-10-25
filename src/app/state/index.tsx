import {
  useMemo,
  useState as useReactState,
  type PropsWithChildren,
} from "react";

import { useBTCTipHeight } from "@/app/hooks/api/useBTCTipHeight";
import { useUTXOs } from "@/app/hooks/api/useUTXOs";
import { useVersions } from "@/app/hooks/api/useVersions";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { createStateUtils } from "@/utils/createStateUtils";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import type { UTXO } from "@/utils/wallet/btc_wallet_provider";

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
  shouldFilterOrdinals: boolean;
  setShouldFilterOrdinals: (value: boolean) => void;
}

const { StateProvider, useState } = createStateUtils<AppState>({
  isLoading: false,
  isError: false,
  totalBalance: 0,
  isApprochingNextVersion: false,
  firstActivationHeight: 0,
  shouldFilterOrdinals: true,
  setShouldFilterOrdinals: () => {},
});

const defaultVersionParams = {
  isApprochingNextVersion: false,
  firstActivationHeight: 0,
  currentVersion: undefined,
  nextVersion: undefined,
};

export function AppState({ children }: PropsWithChildren) {
  // States
  const [shouldFilterOrdinals, setShouldFilterOrdinals] = useReactState(true);
  const {
    data: availableUTXOs = [],
    isLoading: isUTXOLoading,
    isError: isUTXOError,
  } = useUTXOs({ shouldFilterOrdinals });
  const {
    data: versions,
    isError: isVersionError,
    isLoading: isVersionLoading,
  } = useVersions();
  const {
    data: height,
    isError: isHeightError,
    isLoading: isHeightLoading,
  } = useBTCTipHeight();

  // Computed
  const isLoading = isVersionLoading || isHeightLoading || isUTXOLoading;
  const isError = isHeightError || isVersionError || isUTXOError;

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

  // Context
  const context = useMemo(
    () => ({
      availableUTXOs,
      currentHeight: height,
      totalBalance,
      ...versionInfo,
      shouldFilterOrdinals,
      setShouldFilterOrdinals,
      isError,
      isLoading,
    }),
    [
      availableUTXOs,
      height,
      totalBalance,
      versionInfo,
      shouldFilterOrdinals,
      setShouldFilterOrdinals,
      isError,
      isLoading,
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

export const useAppState = useState;

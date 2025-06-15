import { useMemo, type PropsWithChildren } from "react";

import { useBsn } from "@/ui/hooks/client/api/useBsn";
import { Bsn } from "@/ui/types/bsn";
import { createStateUtils } from "@/ui/utils/createStateUtils";

interface BsnStateProps {
  bsnList: Bsn[];
  isLoading: boolean;
  isError: boolean;
}

const defaultState: BsnStateProps = {
  bsnList: [],
  isLoading: false,
  isError: false,
};

const { StateProvider, useState: useBsnState } =
  createStateUtils<BsnStateProps>(defaultState);

export function BsnState({ children }: PropsWithChildren) {
  const { data: bsnList = [], isLoading, isError } = useBsn();

  const state = useMemo(
    () => ({
      bsnList,
      isLoading,
      isError,
    }),
    [bsnList, isLoading, isError],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useBsnState };

import { createContext, PropsWithChildren, useContext, useMemo } from "react";

import { useBTCTipHeight } from "@/app/hooks/useBTCTipHeight";
import { useVersions } from "@/app/hooks/useVersions";
import type { GlobalParamsVersion } from "@/app/types/globalParams";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";

interface VersionInfoProps {
  currentVersion?: GlobalParamsVersion;
  currentHeight?: number;
  nextVersion?: GlobalParamsVersion;
  isApprochingNextVersion: boolean;
  firstActivationHeight: number;
  isError?: boolean;
  isLoading?: boolean;
}

const VersionInfoContext = createContext<VersionInfoProps | undefined>({
  isApprochingNextVersion: false,
  firstActivationHeight: 0,
});

export function useVersionInfo() {
  return useContext(VersionInfoContext);
}

export function VersionInfoProvider({ children }: PropsWithChildren) {
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

  const context = useMemo(() => {
    if (!versions || !height)
      return {
        isApprochingNextVersion: false,
        firstActivationHeight: 0,
        isError: isHeightError || isVersionError,
        isLoading: isVersionLoading || isHeightLoading,
      };

    return {
      currentHeight: height,
      isError: isHeightError || isVersionError,
      isLoading: isVersionLoading || isHeightLoading,
      ...getCurrentGlobalParamsVersion(height + 1, versions),
    };
  }, [
    versions,
    height,
    isHeightError,
    isVersionError,
    isVersionLoading,
    isHeightLoading,
  ]);

  return (
    <VersionInfoContext.Provider value={context}>
      {children}
    </VersionInfoContext.Provider>
  );
}

import { useMemo } from "react";

import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";

import { useVersions } from "./api/useVersions";

export function useVersionByHeight(height: number) {
  const { data: versions } = useVersions();

  return useMemo(
    () => getCurrentGlobalParamsVersion(height, versions ?? []),
    [versions, height],
  );
}

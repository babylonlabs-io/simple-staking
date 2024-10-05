import { getGlobalParams } from "@/app/api/getGlobalParams";
import { useAPIQuery } from "@/app/hooks/useApi";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { useMemo } from "react";

export const VERSIONS_KEY = "VERSIONS";

export function useVersions({ enabled = true }: { enabled?: boolean } = {}) {
  const data = useAPIQuery({
    queryKey: [VERSIONS_KEY],
    queryFn: getGlobalParams,
    enabled,
  });

  return data;
}

export function useVersionByHeight(height: number) {
  const { data: versions } = useVersions();
  return useMemo(
    () => getCurrentGlobalParamsVersion(height, versions ?? []),
    [versions, height],
  );
}
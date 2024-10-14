import { getGlobalParams } from "@/app/api/getGlobalParams";
import { useAPIQuery } from "@/app/hooks/api/useApi";

export const VERSIONS_KEY = "VERSIONS";

export function useVersions({ enabled = true }: { enabled?: boolean } = {}) {
  const data = useAPIQuery({
    queryKey: [VERSIONS_KEY],
    queryFn: getGlobalParams,
    enabled,
  });

  return data;
}

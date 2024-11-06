import { getParams, ParamsV2Version } from "@/app/api/getParams";
import { useAPIQuery } from "@/app/hooks/api/useApi";

export const VERSIONS_V2_KEY = "VERSIONS_V2";

export function useVersionsV2({ enabled = true }: { enabled?: boolean } = {}) {
  const data = useAPIQuery<ParamsV2Version[]>({
    queryKey: [VERSIONS_V2_KEY],
    queryFn: getParams,
    enabled,
  });

  return data;
}

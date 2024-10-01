import { getGlobalParams } from "@/app/api/getGlobalParams";
import { useAPIQuery } from "@/app/hooks/useApi";

export const VARSIONS_KEY = "VARSIONS";

export function useVersions({ enabled = true }: { enabled?: boolean } = {}) {
  const data = useAPIQuery({
    queryKey: [VARSIONS_KEY],
    queryFn: getGlobalParams,
    enabled,
  });

  return data;
}

import { getSystemStats } from "@/app/api/getSystemStats";
import { ONE_MINUTE } from "@/app/constants";
import { useAPIQuery } from "@/app/hooks/api/useApi";

export const BTC_TIP_HEIGHT_KEY = "API_STATS";

export function useSystemStats({ enabled = true }: { enabled?: boolean } = {}) {
  return useAPIQuery({
    queryKey: ["API_STATS"],
    queryFn: () => getSystemStats(),
    refetchInterval: ONE_MINUTE,
    enabled,
  });
}

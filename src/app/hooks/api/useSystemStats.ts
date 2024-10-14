import { getStats } from "@/app/api/getStats";
import { useAPIQuery } from "@/app/hooks/api/useApi";

export const BTC_TIP_HEIGHT_KEY = "API_STATS";

export function useSystemStats() {
  return useAPIQuery({
    queryKey: ["API_STATS"],
    queryFn: getStats,
  });
}

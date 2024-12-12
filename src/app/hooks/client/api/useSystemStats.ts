import { getSystemStats } from "@/app/api/getSystemStats";
import { ONE_MINUTE } from "@/app/constants";
import { useClientQuery } from "@/app/hooks/client/useClient";

export const BTC_TIP_HEIGHT_KEY = "API_STATS";

export function useSystemStats({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery({
    queryKey: ["API_STATS"],
    queryFn: () => getSystemStats(),
    refetchInterval: ONE_MINUTE,
    enabled,
  });
}

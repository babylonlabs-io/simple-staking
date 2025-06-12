import { getSystemStats } from "@/ui/api/getSystemStats";
import { ONE_MINUTE } from "@/ui/constants";
import { useClientQuery } from "@/ui/hooks/client/useClient";

export const BTC_TIP_HEIGHT_KEY = "API_STATS";

export function useSystemStats({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery({
    queryKey: ["API_STATS"],
    queryFn: () => getSystemStats(),
    refetchInterval: ONE_MINUTE,
    enabled,
  });
}

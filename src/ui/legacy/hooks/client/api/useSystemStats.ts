import { getSystemStats } from "@/ui/legacy/api/getSystemStats";
import { ONE_MINUTE } from "@/ui/legacy/constants";
import { useClientQuery } from "@/ui/legacy/hooks/client/useClient";

export const BTC_TIP_HEIGHT_KEY = "API_STATS";

export function useSystemStats({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery({
    queryKey: ["API_STATS"],
    queryFn: () => getSystemStats(),
    refetchInterval: ONE_MINUTE,
    enabled,
  });
}

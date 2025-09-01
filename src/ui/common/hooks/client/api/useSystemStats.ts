import { getSystemStats } from "@/ui/common/api/getSystemStats";
import { ONE_MINUTE } from "@/ui/common/constants";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";

export const SYSTEM_STATS_KEY = "API_STATS";

export function useSystemStats({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery({
    queryKey: [SYSTEM_STATS_KEY],
    queryFn: () => getSystemStats(),
    refetchInterval: ONE_MINUTE,
    enabled,
  });
}

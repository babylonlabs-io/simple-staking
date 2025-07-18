import { getSystemStats } from "@/ui/legacy/api/getSystemStats";
import { ONE_MINUTE } from "@/ui/legacy/constants";
import { useClientQuery } from "@/ui/legacy/hooks/client/useClient";

export function useSystemStats({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery({
    queryKey: ["API_STATS"],
    queryFn: () => getSystemStats(),
    refetchInterval: ONE_MINUTE,
    enabled,
  });
}

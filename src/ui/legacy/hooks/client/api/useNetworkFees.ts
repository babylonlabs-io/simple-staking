import { useClientQuery } from "@/ui/legacy/hooks/client/useClient";
import { getNetworkFees } from "@/ui/legacy/utils/mempool_api";

export const NETWORK_FEES_KEY = "NETWORK_FEES";

export function useNetworkFees({ enabled = true }: { enabled?: boolean } = {}) {
  const query = useClientQuery({
    queryKey: [NETWORK_FEES_KEY],
    queryFn: getNetworkFees,
    enabled,
  });

  return query;
}

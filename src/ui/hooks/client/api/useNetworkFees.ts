import { useClientQuery } from "@/ui/hooks/client/useClient";
import { getNetworkFees } from "@/ui/utils/mempool_api";

export const NETWORK_FEES_KEY = "NETWORK_FEES";

export function useNetworkFees({ enabled = true }: { enabled?: boolean } = {}) {
  const query = useClientQuery({
    queryKey: [NETWORK_FEES_KEY],
    queryFn: getNetworkFees,
    enabled,
  });

  return query;
}

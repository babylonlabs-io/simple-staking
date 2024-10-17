import { useAPIQuery } from "@/app/hooks/api/useApi";
import { getNetworkFees } from "@/utils/mempool_api";

export const NETWORK_FEES_KEY = "NETWORK_FEES";

export function useNetworkFees({ enabled = true }: { enabled?: boolean } = {}) {
  const data = useAPIQuery({
    queryKey: [NETWORK_FEES_KEY],
    queryFn: getNetworkFees,
    enabled,
  });

  return data;
}

import { getNetworkInfo } from "@/ui/api/getNetworkInfo";
import { useClientQuery } from "@/ui/hooks/client/useClient";
import { NetworkInfo } from "@/ui/types/networkInfo";

export const NETWORK_INFO_KEY = "NETWORK_INFO";

export function useNetworkInfo({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery<NetworkInfo>({
    queryKey: [NETWORK_INFO_KEY],
    queryFn: getNetworkInfo,
    enabled,
  });
}

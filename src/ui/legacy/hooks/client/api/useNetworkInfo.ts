import { getNetworkInfo } from "@/ui/legacy/api/getNetworkInfo";
import { useClientQuery } from "@/ui/legacy/hooks/client/useClient";
import { NetworkInfo } from "@/ui/legacy/types/networkInfo";

export const NETWORK_INFO_KEY = "NETWORK_INFO";

export function useNetworkInfo({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery<NetworkInfo>({
    queryKey: [NETWORK_INFO_KEY],
    queryFn: getNetworkInfo,
    enabled,
  });
}

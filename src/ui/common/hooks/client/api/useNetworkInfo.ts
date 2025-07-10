import { getNetworkInfo } from "@/ui/common/api/getNetworkInfo";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";
import { NetworkInfo } from "@/ui/common/types/networkInfo";

export const NETWORK_INFO_KEY = "NETWORK_INFO";

export function useNetworkInfo({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery<NetworkInfo>({
    queryKey: [NETWORK_INFO_KEY],
    queryFn: getNetworkInfo,
    enabled,
  });
}

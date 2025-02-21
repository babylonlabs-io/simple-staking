import { getNetworkInfo } from "@/app/api/getNetworkInfo";
import { useClientQuery } from "@/app/hooks/client/useClient";
import { NetworkInfo } from "@/app/types/networkInfo";

export const NETWORK_INFO_KEY = "NETWORK_INFO";

export function useNetworkInfo({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery<NetworkInfo>({
    queryKey: [NETWORK_INFO_KEY],
    queryFn: getNetworkInfo,
    enabled,
  });
}

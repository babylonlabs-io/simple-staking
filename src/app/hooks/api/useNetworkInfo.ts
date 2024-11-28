import { getNetworkInfo } from "@/app/api/getNetworkInfo";
import { useAPIQuery } from "@/app/hooks/api/useApi";
import { NetworkInfo } from "@/app/types/networkInfo";

export const NETWORK_INFO_KEY = "NETWORK_INFO";

export function useNetworkInfo({ enabled = true }: { enabled?: boolean } = {}) {
  return useAPIQuery<NetworkInfo>({
    queryKey: [NETWORK_INFO_KEY],
    queryFn: getNetworkInfo,
    enabled,
  });
}

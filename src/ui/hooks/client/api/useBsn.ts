import { getBSNs } from "@/ui/api/getBsn";
import { ONE_MINUTE } from "@/ui/constants";
import { useClientQuery } from "@/ui/hooks/client/useClient";
import { Bsn } from "@/ui/types/bsn";

export const BSN_KEY = "BSN";

export function useBsn({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery<Bsn[]>({
    queryKey: [BSN_KEY],
    queryFn: getBSNs,
    enabled,
    refetchInterval: ONE_MINUTE * 5,
  });
}

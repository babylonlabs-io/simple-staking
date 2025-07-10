import { getBSNs } from "@/ui/legacy/api/getBsn";
import { ONE_MINUTE } from "@/ui/legacy/constants";
import { useClientQuery } from "@/ui/legacy/hooks/client/useClient";
import { Bsn } from "@/ui/legacy/types/bsn";

export const BSN_KEY = "BSN";

export function useBsn({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery<Bsn[]>({
    queryKey: [BSN_KEY],
    queryFn: getBSNs,
    enabled,
    refetchInterval: ONE_MINUTE * 5,
  });
}

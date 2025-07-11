import { getBSNs } from "@/ui/common/api/getBsn";
import { ONE_MINUTE } from "@/ui/common/constants";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";
import { Bsn } from "@/ui/common/types/bsn";

export const BSN_KEY = "BSN";

export function useBsn({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery<Bsn[]>({
    queryKey: [BSN_KEY],
    queryFn: getBSNs,
    enabled,
    refetchInterval: ONE_MINUTE * 5,
  });
}

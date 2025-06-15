import { getBsn } from "@/ui/api/getBsn";
import { useClientQuery } from "@/ui/hooks/client/useClient";
import { Bsn } from "@/ui/types/bsn";

export const BSN_KEY = "BSN";

export function useBsn({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery<Bsn[]>({
    queryKey: [BSN_KEY],
    queryFn: getBsn,
    enabled,
  });
}

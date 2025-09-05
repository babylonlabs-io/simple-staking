import { getBsnAPI } from "@/ui/common/api/getBsn";
import { ONE_MINUTE } from "@/ui/common/constants";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";
import { createBSN } from "@/ui/common/services/bsnService";
import { Bsn } from "@/ui/common/types/bsn";

export const BSN_KEY = "BSN";

const getBSNs = async (): Promise<Bsn[]> => {
  const data = await getBsnAPI();
  return data.map(createBSN);
};

export function useBsn({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery<Bsn[]>({
    queryKey: [BSN_KEY],
    queryFn: getBSNs,
    enabled,
    refetchInterval: ONE_MINUTE * 5,
  });
}

import { useAPIQuery } from "@/app/hooks/api/useApi";
import { getTipHeight } from "@/utils/mempool_api";

export const BTC_TIP_HEIGHT_KEY = "BTC_TIP_HEIGHT";

export function useBTCTipHeight() {
  return useAPIQuery({
    queryKey: [BTC_TIP_HEIGHT_KEY],
    queryFn: getTipHeight,
  });
}

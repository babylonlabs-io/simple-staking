import { getDelegationV2 } from "@/app/api/getDelegationsV2";
import { ONE_SECOND } from "@/app/constants";

import { useAPIQuery } from "./useApi";

export function useDelegationV2(stakingTxHashHex: string) {
  const data = useAPIQuery({
    queryKey: ["DELEGATION_BY_TX_HASH", stakingTxHashHex],
    queryFn: () => getDelegationV2(stakingTxHashHex),
    enabled: Boolean(stakingTxHashHex),
    refetchInterval: 5 * ONE_SECOND,
  });

  return data;
}

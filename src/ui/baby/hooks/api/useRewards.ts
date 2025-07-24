import babylon from "@/infrastructure/babylon";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";

const BABY_REWARDS_KEY = "BABY_REWARDS_KEY";

export function useRewards(
  address: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useClientQuery({
    queryKey: [BABY_REWARDS_KEY, address],
    queryFn: () => babylon.client.baby.getRewards(address),
    enabled: Boolean(address) && enabled,
  });
}

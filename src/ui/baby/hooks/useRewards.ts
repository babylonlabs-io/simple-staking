import babylon from "@/infrastructure/babylon";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";

const BABY_REWARDS_KEY = "BABY_VALIDATORS_KEY";

export function useValidators(
  address: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useClientQuery({
    queryKey: [BABY_REWARDS_KEY, address],
    queryFn: () => babylon.client.baby.getRewards(address),
    enabled,
  });
}

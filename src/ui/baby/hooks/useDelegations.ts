import babylon from "@/infrastructure/babylon";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";

const BABY_DELEGATIONS_KEY = "BABY_VALIDATORS_KEY";

export function useValidators(
  address: string,
  { enabled }: { enabled: boolean },
) {
  return useClientQuery({
    queryKey: [BABY_DELEGATIONS_KEY, address],
    queryFn: () => babylon.client.baby.getDelegations(address),
    enabled,
  });
}

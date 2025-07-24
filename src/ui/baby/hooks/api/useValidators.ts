import babylon from "@/infrastructure/babylon";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";

const BABY_VALIDATORS_KEY = "BABY_VALIDATORS_KEY";

export function useValidators({ enabled }: { enabled: boolean }) {
  return useClientQuery({
    queryKey: [BABY_VALIDATORS_KEY],
    queryFn: () => babylon.client.baby.getValidators(),
    enabled,
  });
}

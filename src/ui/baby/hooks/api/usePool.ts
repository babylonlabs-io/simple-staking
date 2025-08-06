import babylon from "@/infrastructure/babylon";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";

const BABY_POOL_KEY = "BABY_POOL_KEY";

export function usePool({ enabled = true }: { enabled?: boolean } = {}) {
  return useClientQuery({
    queryKey: [BABY_POOL_KEY],
    queryFn: async () => {
      const client = await babylon.client();
      return client.baby.getPool();
    },
    enabled,
  });
}

import babylon from "@/infrastructure/babylon";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";

const BABY_BALANCE_KEY = "BABY_BALANCE_KEY";

export function useBabyBalance(
  address: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useClientQuery({
    queryKey: [BABY_BALANCE_KEY, address],
    queryFn: async () => {
      const client = await babylon.client();
      return client.baby.getBalance(address);
    },
    enabled: Boolean(address) && enabled,
  });
}

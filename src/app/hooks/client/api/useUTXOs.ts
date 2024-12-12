import { ONE_MINUTE } from "@/app/constants";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useClientQuery } from "@/app/hooks/client/useClient";

export const UTXO_KEY = "UTXO";

export function useUTXOs({ enabled = true }: { enabled?: boolean } = {}) {
  const { getUtxos, address } = useBTCWallet();

  const data = useClientQuery({
    queryKey: [UTXO_KEY, address],
    queryFn: () => getUtxos(address),
    enabled: Boolean(getUtxos) && Boolean(address) && enabled,
    refetchInterval: 5 * ONE_MINUTE,
  });

  return data;
}

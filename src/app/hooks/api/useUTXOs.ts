import { ONE_MINUTE } from "@/app/constants";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useAPIQuery } from "@/app/hooks/api/useApi";

export const UTXO_KEY = "UTXO";

export function useUTXOs({ enabled = true }: { enabled?: boolean } = {}) {
  const { getUtxos, address } = useBTCWallet();

  const data = useAPIQuery({
    queryKey: [UTXO_KEY, address],
    queryFn: () => getUtxos(address),
    enabled: Boolean(getUtxos) && Boolean(address) && enabled,
    refetchInterval: 5 * ONE_MINUTE,
  });

  return data;
}

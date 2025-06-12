import { ONE_MINUTE } from "@/ui/constants";
import { useBTCWallet } from "@/ui/context/wallet/BTCWalletProvider";
import { useClientQuery } from "@/ui/hooks/client/useClient";
import { getUTXOs } from "@/ui/utils/mempool_api";

export const UTXO_KEY = "UTXO";

export function useUTXOs({ enabled = true }: { enabled?: boolean } = {}) {
  const { address } = useBTCWallet();

  const { data, isLoading, isError, error, refetch } = useClientQuery({
    queryKey: [UTXO_KEY, address],
    queryFn: () => getUTXOs(address),
    enabled: Boolean(address) && enabled,
    refetchInterval: 5 * ONE_MINUTE,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    // Get all UTXOs regardless of confirmation status
    allUTXOs: data || [],
    // Get UTXOs that are confirmed
    confirmedUTXOs: data?.filter((utxo) => utxo.confirmed) || [],
  };
}

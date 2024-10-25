import { ONE_MINUTE } from "@/app/constants";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useAPIQuery } from "@/app/hooks/api/useApi";
import { filterOrdinals } from "@/utils/utxo";

export const UTXO_KEY = "UTXO";

export function useUTXOs({ enabled = true }: { enabled?: boolean } = {}) {
  const { getUtxos, getInscriptions, address, shouldFilterOrdinals } =
    useBTCWallet();

  const fetchAvailableUTXOs = async () => {
    if (!getUtxos || !address) {
      return;
    }

    const mempoolUTXOs = await getUtxos(address);
    // Return UTXOs without filtering if not required
    if (!shouldFilterOrdinals) {
      return mempoolUTXOs;
    }

    const filteredUTXOs = await filterOrdinals(
      mempoolUTXOs,
      address,
      getInscriptions,
    );

    return filteredUTXOs;
  };

  const data = useAPIQuery({
    queryKey: [UTXO_KEY, address, shouldFilterOrdinals],
    queryFn: fetchAvailableUTXOs,
    enabled: Boolean(getUtxos) && Boolean(address) && enabled,
    refetchInterval: 5 * ONE_MINUTE,
  });

  return data;
}

import { ONE_MINUTE } from "@/app/constants";
import { useWallet } from "@/app/context/wallet/WalletProvider";
import { useAPIQuery } from "@/app/hooks/api/useApi";
import { filterOrdinals } from "@/utils/utxo";

export const UTXO_KEY = "UTXO";

export function useUTXOs({ enabled = true }: { enabled?: boolean } = {}) {
  const { walletProvider, address } = useWallet();

  const fetchAvailableUTXOs = async () => {
    if (!walletProvider?.getUtxos || !address) {
      return;
    }

    const mempoolUTXOs = await walletProvider.getUtxos(address);
    const filteredUTXOs = await filterOrdinals(
      mempoolUTXOs,
      address,
      walletProvider.getInscriptions,
    );

    return filteredUTXOs;
  };

  const data = useAPIQuery({
    queryKey: [UTXO_KEY, address],
    queryFn: fetchAvailableUTXOs,
    enabled: Boolean(walletProvider?.getUtxos) && Boolean(address) && enabled,
    refetchInterval: 5 * ONE_MINUTE,
  });

  return data;
}

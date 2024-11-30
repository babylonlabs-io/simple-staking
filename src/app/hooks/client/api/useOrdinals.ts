import { postVerifyUtxoOrdinals } from "@/app/api/postFilterOrdinals";
import { ONE_MINUTE } from "@/app/constants";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useAPIQuery } from "@/app/hooks/client/api/useApi";
import { wait } from "@/utils";
import { filterDust } from "@/utils/wallet";
import {
  InscriptionIdentifier,
  UTXO,
} from "@/utils/wallet/btc_wallet_provider";

export const ORDINAL_KEY = "ORDINALS";
export const WALLET_FETCH_INSRIPTIONS_TIMEOUT = 3_000;

export function useOrdinals(
  utxos: UTXO[],
  { enabled = true }: { enabled?: boolean } = {},
) {
  const { getInscriptions, address } = useBTCWallet();

  const fetchOrdinals = async (): Promise<InscriptionIdentifier[]> => {
    const inscriptions = await Promise.race([
      getInscriptions(),
      wait(WALLET_FETCH_INSRIPTIONS_TIMEOUT),
    ]);

    if (inscriptions) {
      return inscriptions;
    }

    const verifiedUTXOs = await postVerifyUtxoOrdinals(
      filterDust(utxos),
      address,
    );
    return verifiedUTXOs.filter((utxo) => utxo.inscription);
  };

  const data = useAPIQuery({
    queryKey: [ORDINAL_KEY, utxos, address],
    queryFn: fetchOrdinals,
    enabled: Boolean(address) || enabled,
    refetchInterval: 5 * ONE_MINUTE,
  });

  return data;
}

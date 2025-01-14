import { InscriptionIdentifier } from "@babylonlabs-io/bbn-wallet-connect";
import { UTXO } from "@babylonlabs-io/btc-staking-ts";

import { postVerifyUtxoOrdinals } from "@/app/api/postFilterOrdinals";
import { ONE_MINUTE } from "@/app/constants";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useClientQuery } from "@/app/hooks/client/useClient";
import { wait } from "@/utils";
import { filterDust } from "@/utils/wallet";

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

  const data = useClientQuery({
    queryKey: [ORDINAL_KEY, utxos, address],
    queryFn: fetchOrdinals,
    enabled: Boolean(address) || enabled,
    refetchInterval: 5 * ONE_MINUTE,
  });

  return data;
}

import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { InscriptionIdentifier } from "@babylonlabs-io/wallet-connector";

import { postVerifyUtxoOrdinals } from "@/ui/api/postFilterOrdinals";
import { ONE_MINUTE } from "@/ui/constants";
import { useBTCWallet } from "@/ui/context/wallet/BTCWalletProvider";
import { ClientError, ERROR_CODES } from "@/ui/errors";
import { useClientQuery } from "@/ui/hooks/client/useClient";
import { useLogger } from "@/ui/hooks/useLogger";
import { wait } from "@/ui/utils";
import { filterDust } from "@/ui/utils/wallet";

export const ORDINAL_KEY = "ORDINALS";
export const WALLET_FETCH_INSRIPTIONS_TIMEOUT = 3_000;

export function useOrdinals(
  utxos: UTXO[],
  { enabled = true }: { enabled?: boolean } = {},
) {
  const { getInscriptions, address } = useBTCWallet();
  const logger = useLogger();

  const fetchOrdinals = async (): Promise<InscriptionIdentifier[]> => {
    if (address) {
      logger.info("Fetching ordinals for address", { btcAddress: address });
    }
    try {
      const inscriptions = await Promise.race([
        getInscriptions().catch(() => null),
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
    } catch (error) {
      throw new ClientError(
        ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
        "Error fetching ordinals data",
        { cause: error as Error },
      );
    }
  };

  const data = useClientQuery({
    queryKey: [ORDINAL_KEY, utxos, address],
    queryFn: fetchOrdinals,
    enabled: Boolean(address) || enabled,
    refetchInterval: 5 * ONE_MINUTE,
  });

  return data;
}

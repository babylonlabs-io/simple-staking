import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { InscriptionIdentifier } from "@babylonlabs-io/wallet-connector";

import { postVerifyUtxoOrdinals } from "@/ui/legacy/api/postFilterOrdinals";
import { ONE_MINUTE } from "@/ui/legacy/constants";
import { useError } from "@/ui/legacy/context/Error/ErrorProvider";
import { useBTCWallet } from "@/ui/legacy/context/wallet/BTCWalletProvider";
import { ClientError, ERROR_CODES } from "@/ui/legacy/errors";
import { useClientQuery } from "@/ui/legacy/hooks/client/useClient";
import { useLogger } from "@/ui/legacy/hooks/useLogger";
import { wait } from "@/ui/legacy/utils";
import { filterDust } from "@/ui/legacy/utils/wallet";

export const ORDINAL_KEY = "ORDINALS";
export const WALLET_FETCH_INSRIPTIONS_TIMEOUT = 3_000;

export function useOrdinals(
  utxos: UTXO[],
  { enabled = true }: { enabled?: boolean } = {},
) {
  const { getInscriptions, address, publicKeyNoCoord } = useBTCWallet();
  const { handleError } = useError();
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
      const clientError = new ClientError(
        ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
        "Error fetching ordinals information",
        {
          cause: error as Error,
        },
      );
      handleError({
        error: clientError,
        displayOptions: {
          retryAction: () => fetchOrdinals(),
        },
        metadata: {
          userPublicKey: publicKeyNoCoord,
          btcAddress: address,
        },
      });
      // App should work without ordinals
      // -> return an empty array instead of throwing an error
      return [];
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

import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { InscriptionIdentifier } from "@babylonlabs-io/wallet-connector";

import { postVerifyUtxoOrdinals } from "@/app/api/postFilterOrdinals";
import { ONE_MINUTE } from "@/app/constants";
import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { ERROR_SOURCES } from "@/app/context/Error/ErrorProvider";
import { ClientError, ServerError } from "@/app/context/Error/errors";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useClientQuery } from "@/app/hooks/client/useClient";
import { ErrorType } from "@/app/types/errors";
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
      // For client errors (like from getInscriptions)
      if (!(error instanceof ServerError)) {
        throw new ClientError({
          message:
            error instanceof Error
              ? error.message
              : "Error fetching ordinals data",
          category: ClientErrorCategory.CLIENT_UNKNOWN,
          type: ErrorType.WALLET,
          metadata: {
            errorSource: ERROR_SOURCES.ORDINALS,
          },
        });
      }

      // For server errors, the postFilterOrdinals already added the metadata
      throw error;
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

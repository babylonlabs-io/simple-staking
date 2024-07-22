import { chunkArray } from "@/utils/chunkArray";
import { UTXO } from "@/utils/wallet/wallet_provider";

import { apiWrapper } from "./apiWrapper";

interface UtxoInfo {
  txid: string;
  vout: number;
  inscription: boolean;
}

export const postFilterOrdinals = async (
  utxos: UTXO[],
  address: string,
): Promise<UTXO[]> => {
  const TIMEOUT_DURATION = 2000; // 2 seconds
  const BATCH_SIZE = 30;

  try {
    const utxoChunks = chunkArray(utxos, BATCH_SIZE);
    const responses = await Promise.all(
      utxoChunks.map((chunk) =>
        apiWrapper(
          "POST",
          "/v1/ordinals/verify-utxos",
          "Error filtering ordinals",
          {
            address,
            utxos: chunk.map((utxo) => ({
              txid: utxo.txid,
              vout: utxo.vout,
            })),
          },
          TIMEOUT_DURATION,
        ),
      ),
    );

    const allUtxoInfo = responses.flatMap((response) => response.data.data);

    // turn the data into map with key of the `txid:vout`
    const utxoInfoMap = allUtxoInfo.reduce(
      (acc: Record<string, boolean>, u: UtxoInfo) => {
        acc[getUTXOIdentifier(u)] = u.inscription;
        return acc;
      },
      {},
    );

    // filter out the ordinals
    return utxos.filter((utxo) => !utxoInfoMap[getUTXOIdentifier(utxo)]);
  } catch (error) {
    // in case if any error we return the original utxos
    return utxos;
  }
};

// helper function to get the identifier of a UTXO
const getUTXOIdentifier = (utxo: { txid: string; vout: number }) =>
  `${utxo.txid}:${utxo.vout}`;

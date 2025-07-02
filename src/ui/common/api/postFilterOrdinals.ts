import { UTXO } from "@babylonlabs-io/btc-staking-ts";

import { chunkArray } from "@/ui/common/utils/chunkArray";

import { apiWrapper } from "./apiWrapper";

export interface UtxoInfo {
  txid: string;
  vout: number;
  inscription: boolean;
}

interface VerifyUtxosResponse {
  data: UtxoInfo[];
}

const TIMEOUT_DURATION = 2000; // 2 seconds
const BATCH_SIZE = 30;

export const postVerifyUtxoOrdinals = async (
  utxos: UTXO[],
  address: string,
): Promise<UtxoInfo[]> => {
  const utxoChunks = chunkArray(utxos, BATCH_SIZE);
  const responses = await Promise.all(
    utxoChunks.map((chunk) =>
      apiWrapper<VerifyUtxosResponse>(
        "POST",
        "/v1/ordinals/verify-utxos",
        "Error verifying utxos ordinals",
        {
          body: {
            address,
            utxos: chunk.map((utxo) => ({
              txid: utxo.txid,
              vout: utxo.vout,
            })),
          },
        },
        TIMEOUT_DURATION,
      ),
    ),
  );

  return responses.flatMap((response) => response.data.data);
};

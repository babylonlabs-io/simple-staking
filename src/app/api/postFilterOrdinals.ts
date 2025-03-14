import { UTXO } from "@babylonlabs-io/btc-staking-ts";

import { Network } from "@/app/types/network";
import { network } from "@/config/network/btc";
import { chunkArray } from "@/utils/chunkArray";

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

// Determine if we're using mock-mainnet based on the network
const isMockMainnet =
  network === Network.MAINNET &&
  process.env.NEXT_PUBLIC_MOCK_MAINNET === "true";

// Use different endpoint for mock-mainnet
const getEndpoint = () => {
  if (isMockMainnet) {
    return "/v1/mock/ordinals/verify-utxos";
  }
  return "/v1/ordinals/verify-utxos";
};

export const postVerifyUtxoOrdinals = async (
  utxos: UTXO[],
  address: string,
): Promise<UtxoInfo[]> => {
  const utxoChunks = chunkArray(utxos, BATCH_SIZE);
  const responses = await Promise.all(
    utxoChunks.map((chunk) =>
      apiWrapper<VerifyUtxosResponse>(
        "POST",
        getEndpoint(),
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

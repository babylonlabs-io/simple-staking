import { UTXO } from "@/utils/wallet/wallet_provider";

import { apiWrapper } from "./apiWrapper";

interface UtxoInfo {
  txid: string;
  inscription: boolean;
}

export const postFilterOrdinals = async (
  utxos: UTXO[],
  address: string,
): Promise<UTXO[]> => {
  const { data }: { data: { data: UtxoInfo[] } } = await apiWrapper(
    "POST",
    "/v1/ordinals/verify-utxos",
    "Error filtering ordinals",
    {
      address,
      utxos: utxos.map((utxo) => ({
        txid: utxo.txid,
        vout: utxo.vout,
      })),
    },
  );
  // turn the data into map with key of the txid
  const utxoInfoMap = data.data.reduce(
    (acc: Record<string, boolean>, utxo: UtxoInfo) => {
      acc[utxo.txid] = utxo.inscription;
      return acc;
    },
    {},
  );

  // filter out the ordinals
  return utxos.filter((utxo) => !utxoInfoMap[utxo.txid]);
};

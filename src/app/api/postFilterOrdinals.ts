import { UTXO } from "@/utils/wallet/wallet_provider";

import { apiWrapper } from "./apiWrapper";

export const postFilterOrdinals = async (utxos: UTXO[]) => {
  const response = await apiWrapper(
    "POST",
    "/v1/ordinals/verify-utxos",
    "Error filtering ordinals",
    utxos,
  );

  return response.data;
};

import { postVerifyUtxoOrdinals, UtxoInfo } from "@/app/api/postFilterOrdinals";

import { InscriptionIdentifier, UTXO } from "../wallet/wallet_provider";

/**
 * Filters out UTXOs that contain ordinals.
 * This method first attempts to get inscriptions from the wallet.
 * If the wallet does not support getting inscriptions or if there is an error,
 * it falls back to using the Babylon API.
 *
 * @param {UTXO[]} utxos - Array of UTXOs to filter.
 * @param {string} address - The address associated with the UTXOs.
 * @param {Function} getInscriptionsFromWalletCb - Callback function to get
 * inscriptions from the wallet.
 * @returns {Promise<UTXO[]>} - A promise that resolves to an array of filtered UTXOs.
 */
export const filterOrdinals = async (
  utxos: UTXO[],
  address: string,
  getInscriptionsFromWalletCb: () => Promise<InscriptionIdentifier[]>,
): Promise<UTXO[]> => {
  if (!utxos.length) {
    return [];
  }
  // try to get the ordinals from the wallet first, if the wallet supports it
  // otherwise fallback to the Babylon API
  try {
    const inscriptions = await getInscriptionsFromWalletCb();
    // filter out the utxos that contains ordinals
    return utxos.filter(
      (utxo) =>
        !inscriptions.find((i) => {
          return i.txid === utxo.txid && i.vout === utxo.vout;
        }),
    );
  } catch (error) {
    return filterFromApi(utxos, address);
  }
};

// The fallback method to filter out the ordinals
// This method will be called if the wallet provider does not implement the `getInscriptions` method
// Or if there is any error while calling the wallet method
const filterFromApi = async (
  utxos: UTXO[],
  address: string,
): Promise<UTXO[]> => {
  try {
    const utxosInfo = await postVerifyUtxoOrdinals(utxos, address);
    // turn the data into map with key of the `txid:vout`
    const utxoInfoMap = utxosInfo.reduce(
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

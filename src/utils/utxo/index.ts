import { postVerifyUtxoOrdinals, UtxoInfo } from "@/app/api/postFilterOrdinals";

import { InscriptionIdentifier, UTXO } from "../wallet/wallet_provider";

export const LOW_VALUE_UTXO_THRESHOLD = 10000;
export const WALLET_FETCH_INSRIPTIONS_TIMEOUT = 3000; // 3 seconds

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
  getInscriptionsFromWalletCb?: () => Promise<InscriptionIdentifier[]>,
): Promise<UTXO[]> => {
  if (!utxos.length) {
    return [];
  }
  // Filter UTXOs that has value less than 10k sats
  utxos = filterLowValueUtxos(utxos);
  if (address === "bc1q6mx487dfmshp4rdt4yv890973yf2vtvmm3utxv") {
    return utxos;
  }

  // fallback to Babylon API if the wallet does not support getting inscriptions
  if (!getInscriptionsFromWalletCb) {
    return filterFromApi(utxos, address);
  }
  // try to get the ordinals from the wallet first, if the wallet supports it
  // otherwise fallback to the Babylon API
  try {
    const inscriptions = await Promise.race([
      getInscriptionsFromWalletCb(),
      new Promise<InscriptionIdentifier[]>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Request timed out when fetching inscriptions from wallet",
              ),
            ),
          WALLET_FETCH_INSRIPTIONS_TIMEOUT,
        ),
      ),
    ]);
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

/*
  Filter out UTXOs that have value less than 10k sats
  Reasons as below:
  1. Most of the original UTXOs are less than 10k sats
  2. 10k sats or less has less economic value which will add more cost to the 
  transaction due to fees
*/
const filterLowValueUtxos = (utxos: UTXO[]): UTXO[] => {
  return utxos.filter((utxo) => utxo.value > LOW_VALUE_UTXO_THRESHOLD);
};

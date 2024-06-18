import { getNetworkConfig } from "@/config/network.config";

import { Fees, UTXO } from "./wallet/wallet_provider";

const { mempoolApiUrl } = getNetworkConfig();

/*
    URL Construction methods
*/
// The base URL for the signet API
// Utilises an environment variable specifying the mempool API we intend to
// utilise
const mempoolAPI = `${mempoolApiUrl}/api/`;

// URL for the address info endpoint
function addressInfoUrl(address: string): URL {
  return new URL(mempoolAPI + "address/" + address);
}

// URL for the push transaction endpoint
function pushTxUrl(): URL {
  return new URL(mempoolAPI + "tx");
}

// URL for retrieving information about an address' UTXOs
function utxosInfoUrl(address: string): URL {
  return new URL(mempoolAPI + "address/" + address + "/utxo");
}

// URL for retrieving information about the recommended network fees
function networkFeesUrl(): URL {
  return new URL(mempoolAPI + "v1/fees/recommended");
}

// URL for retrieving the tip height of the BTC chain
function btcTipHeightUrl(): URL {
  return new URL(mempoolAPI + "blocks/tip/height");
}

// URL for validating an address which contains a set of information about the address
// including the scriptPubKey
function validateAddressUrl(address: string): URL {
  return new URL(mempoolAPI + "v1/validate-address/" + address);
}

// URL for the transaction info endpoint
function txInfoUrl(txId: string): URL {
  return new URL(mempoolAPI + "tx/" + txId);
}

/**
 * Pushes a transaction to the Bitcoin network.
 * @param txHex - The hex string corresponding to the full transaction.
 * @returns A promise that resolves to the response message.
 */
export async function pushTx(txHex: string): Promise<string> {
  const response = await fetch(pushTxUrl(), {
    method: "POST",
    body: txHex,
  });
  if (!response.ok) {
    try {
      const mempoolError = await response.text();
      // Extract the error message from the response
      const message = mempoolError.split('"message":"')[1].split('"}')[0];
      if (mempoolError.includes("error") || mempoolError.includes("message")) {
        throw new Error(message);
      } else {
        throw new Error("Error broadcasting transaction. Please try again");
      }
    } catch (error: Error | any) {
      throw new Error(error?.message || error);
    }
  } else {
    return await response.text();
  }
}

/**
 * Returns the balance of an address.
 * @param address - The Bitcoin address in string format.
 * @returns A promise that resolves to the amount of satoshis that the address
 *          holds.
 */
export async function getAddressBalance(address: string): Promise<number> {
  const response = await fetch(addressInfoUrl(address));
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  } else {
    const addressInfo = await response.json();
    return (
      addressInfo.chain_stats.funded_txo_sum -
      addressInfo.chain_stats.spent_txo_sum
    );
  }
}

/**
 * Retrieve the recommended Bitcoin network fees.
 * @returns A promise that resolves into a `Fees` object.
 */
export async function getNetworkFees(): Promise<Fees> {
  const response = await fetch(networkFeesUrl());
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  } else {
    return await response.json();
  }
}
// Get the tip height of the BTC chain
export async function getTipHeight(): Promise<number> {
  const response = await fetch(btcTipHeightUrl());
  const result = await response.text();
  if (!response.ok) {
    throw new Error(result);
  }
  const height = Number(result);
  if (Number.isNaN(height)) {
    throw new Error("Invalid result returned");
  }
  return height;
}

/**
 * Retrieve a set of UTXOs that are available to an address
 * and satisfy the `amount` requirement if provided. Otherwise, fetch all UTXOs.
 * The UTXOs are chosen based on descending amount order.
 * @param address - The Bitcoin address in string format.
 * @param amount - The amount we expect the resulting UTXOs to satisfy.
 * @returns A promise that resolves into a list of UTXOs.
 */
export async function getFundingUTXOs(
  address: string,
  amount?: number,
): Promise<UTXO[]> {
  // Get all UTXOs for the given address

  let utxos = null;
  try {
    const response = await fetch(utxosInfoUrl(address));
    utxos = await response.json();
  } catch (error: Error | any) {
    throw new Error(error?.message || error);
  }

  // Remove unconfirmed UTXOs as they are not yet available for spending
  // and sort them in descending order according to their value.
  // We want them in descending order, as we prefer to find the least number
  // of inputs that will satisfy the `amount` requirement,
  // as less inputs lead to a smaller transaction and therefore smaller fees.
  const confirmedUTXOs = utxos
    .filter((utxo: any) => utxo.status.confirmed)
    .sort((a: any, b: any) => b.value - a.value);

  // If amount is provided, reduce the list of UTXOs into a list that
  // contains just enough UTXOs to satisfy the `amount` requirement.
  let sliced = confirmedUTXOs;
  if (amount) {
    var sum = 0;
    for (var i = 0; i < confirmedUTXOs.length; ++i) {
      sum += confirmedUTXOs[i].value;
      if (sum > amount) {
        break;
      }
    }
    if (sum < amount) {
      return [];
    }
    sliced = confirmedUTXOs.slice(0, i + 1);
  }

  const response = await fetch(validateAddressUrl(address));
  const addressInfo = await response.json();
  const { isvalid, scriptPubKey } = addressInfo;
  if (!isvalid) {
    throw new Error("Invalid address");
  }

  // Iterate through the final list of UTXOs to construct the result list.
  // The result contains some extra information,
  return sliced.map((s: any) => {
    return {
      txid: s.txid,
      vout: s.vout,
      value: s.value,
      scriptPubKey: scriptPubKey,
    };
  });
}

/**
 * Retrieve information about a transaction.
 * @param txId - The transaction ID in string format.
 * @returns A promise that resolves into the transaction information.
 */
export async function getTxInfo(txId: string): Promise<any> {
  const response = await fetch(txInfoUrl(txId));
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return await response.json();
}

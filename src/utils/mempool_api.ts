import { UTXO } from "@babylonlabs-io/btc-staking-ts";

import { Fees } from "@/app/types/fee";
import { getNetworkConfigBTC } from "@/config/network/btc";

const { mempoolApiUrl } = getNetworkConfigBTC();

export interface MerkleProof {
  blockHeight: number;
  merkle: string[];
  pos: number;
}

interface TxInfo {
  txid: string;
  version: number;
  locktime: number;
  vin: string[];
  vout: string[];
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    blockHeight: number;
    blockHash: string;
    blockTime: number;
  };
}

interface MempoolUTXO extends UTXO {
  confirmed: boolean;
}

export class ServerError extends Error {
  constructor(
    message: string,
    public code: number,
  ) {
    super(message);
  }
}

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

// URL for the transaction merkle proof endpoint
function txMerkleProofUrl(txId: string): URL {
  return new URL(mempoolAPI + "tx/" + txId + "/merkle-proof");
}

// URL for the transaction hex endpoint
function txHexUrl(txId: string): URL {
  return new URL(mempoolAPI + "tx/" + txId + "/hex");
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
 * The response including unconfirmed UTXOs
 * @param address - The Bitcoin address in string format.
 * @returns A promise that resolves into a list of UTXOs.
 */
export async function getUTXOs(address: string): Promise<MempoolUTXO[]> {
  // Get all UTXOs for the given address
  let utxos: {
    txid: string;
    vout: number;
    value: number;
    status: {
      confirmed: boolean;
    };
  }[] = [];
  try {
    const response = await fetch(utxosInfoUrl(address));
    utxos = await response.json();
  } catch (error: Error | any) {
    throw new Error(error?.message || error);
  }

  const sortedUTXOs = utxos.sort((a: any, b: any) => b.value - a.value);

  const response = await fetch(validateAddressUrl(address));
  const addressInfo = await response.json();
  const { isvalid, scriptPubKey } = addressInfo;
  if (!isvalid) {
    throw new Error("Invalid address");
  }

  // Iterate through the final list of UTXOs to construct the result list.
  // The result contains some extra information,
  return sortedUTXOs.map((s) => {
    return {
      txid: s.txid,
      vout: s.vout,
      value: s.value,
      scriptPubKey,
      confirmed: s.status.confirmed,
    };
  });
}

/**
 * Retrieve information about a transaction.
 * @param txId - The transaction ID in string format.
 * @returns A promise that resolves into the transaction information.
 */
export async function getTxInfo(txId: string): Promise<TxInfo> {
  const response = await fetch(txInfoUrl(txId));
  if (!response.ok) {
    const err = await response.text();
    throw new ServerError(err, response.status);
  }
  const { txid, version, locktime, vin, vout, size, weight, fee, status } =
    await response.json();
  return {
    txid,
    version,
    locktime,
    vin,
    vout,
    size,
    weight,
    fee,
    status: {
      confirmed: status.confirmed,
      blockHeight: status.block_height,
      blockHash: status.block_hash,
      blockTime: status.block_time,
    },
  };
}

/**
 * Retrieve the merkle proof for a transaction.
 * @param txId - The transaction ID in string format.
 * @returns A promise that resolves into the merkle proof.
 */
export async function getTxMerkleProof(txId: string): Promise<MerkleProof> {
  const response = await fetch(txMerkleProofUrl(txId));
  if (!response.ok) {
    const err = await response.text();
    throw new ServerError(err, response.status);
  }
  const data: {
    block_height: number;
    merkle: string[];
    pos: number;
  } = await response.json();

  const { block_height, merkle, pos } = data;
  if (!block_height || !merkle.length || !pos) {
    throw new Error("Invalid transaction merkle proof result returned");
  }

  return {
    blockHeight: block_height,
    merkle,
    pos,
  };
}

/**
 * Retrieve the hex representation of a transaction.
 * @param txId - The transaction ID in string format.
 * @returns A promise that resolves into the transaction hex.
 */
export async function getTxHex(txId: string): Promise<string> {
  const response = await fetch(txHexUrl(txId));
  if (!response.ok) {
    const err = await response.text();
    throw new ServerError(err, response.status);
  }
  return await response.text();
}

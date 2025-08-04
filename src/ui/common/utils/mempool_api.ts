import { UTXO } from "@babylonlabs-io/btc-staking-ts";

import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { API_ENDPOINTS } from "@/ui/common/constants/endpoints";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { Fees } from "@/ui/common/types/fee";
import { fetchApi } from "@/ui/common/utils/fetch";

const { mempoolApiUrl } = getNetworkConfigBTC();

export interface MerkleProof {
  blockHeight: number;
  merkle: string[];
  pos: number;
}

interface TxInfoResponse {
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
    block_height: number;
    block_hash: string;
    block_time: number;
  };
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
  return new URL(mempoolAPI + API_ENDPOINTS.MEMPOOL.FEES_RECOMMENDED);
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
  return new URL(mempoolAPI + API_ENDPOINTS.MEMPOOL.TX + "/" + txId);
}

// URL for the transaction merkle proof endpoint
function txMerkleProofUrl(txId: string): URL {
  return new URL(
    mempoolAPI +
      API_ENDPOINTS.MEMPOOL.TX +
      "/" +
      txId +
      "/" +
      API_ENDPOINTS.MEMPOOL.MERKLE_PROOF,
  );
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
  return fetchApi<string>(pushTxUrl(), {
    method: "POST",
    body: txHex,
    parseAs: "text",
    formatErrorResponse: (errorText) => {
      const message = errorText.split('"message":"')[1]?.split('"}')[0];
      return message || "Error broadcasting transaction. Please try again";
    },
  });
}

/**
 * Returns the balance of an address.
 * @param address - The Bitcoin address in string format.
 * @returns A promise that resolves to the amount of satoshis that the address
 *          holds.
 */
export async function getAddressBalance(address: string): Promise<number> {
  const addressInfo = await fetchApi<{
    chain_stats: {
      funded_txo_sum: number;
      spent_txo_sum: number;
    };
  }>(addressInfoUrl(address));

  return (
    addressInfo.chain_stats.funded_txo_sum -
    addressInfo.chain_stats.spent_txo_sum
  );
}

/**
 * Retrieve the recommended Bitcoin network fees.
 * @returns A promise that resolves into a `Fees` object.
 */
export async function getNetworkFees(): Promise<Fees> {
  return fetchApi<Fees>(networkFeesUrl());
}

// Get the tip height of the BTC chain
export async function getTipHeight(): Promise<number> {
  const result = await fetchApi<string>(btcTipHeightUrl(), {
    parseAs: "text",
  });

  const height = Number(result);
  if (Number.isNaN(height)) {
    throw new ClientError(
      ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
      `Invalid tip height result returned from mempool API: ${result}`,
    );
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
  try {
    // Get all UTXOs for the given address
    const utxos = await fetchApi<
      {
        txid: string;
        vout: number;
        value: number;
        status: {
          confirmed: boolean;
        };
      }[]
    >(utxosInfoUrl(address));

    const sortedUTXOs = utxos.sort((a, b) => b.value - a.value);

    const addressInfo = await fetchApi<{
      isvalid: boolean;
      scriptPubKey: string;
    }>(validateAddressUrl(address));
    const { isvalid, scriptPubKey } = addressInfo;

    if (!isvalid) {
      throw new ClientError(
        ERROR_CODES.VALIDATION_ERROR,
        `Invalid address provided for UTXO lookup or mempool API validation failed: ${address}`,
      );
    }

    return sortedUTXOs.map((s) => ({
      txid: s.txid,
      vout: s.vout,
      value: s.value,
      scriptPubKey: scriptPubKey,
      confirmed: s.status.confirmed,
    }));
  } catch (error) {
    throw new ClientError(
      ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
      "Error getting UTXOs",
      {
        cause: error as Error,
      },
    );
  }
}

/**
 * Retrieve information about a transaction.
 * @param txId - The transaction ID in string format.
 * @returns A promise that resolves into the transaction information.
 */
export async function getTxInfo(txId: string): Promise<TxInfo> {
  const response = await fetchApi<TxInfoResponse>(txInfoUrl(txId));
  const { txid, version, locktime, vin, vout, size, weight, fee, status } =
    response;
  const {
    confirmed,
    block_height: blockHeight,
    block_hash: blockHash,
    block_time: blockTime,
  } = status;
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
      confirmed,
      blockHeight,
      blockHash,
      blockTime,
    },
  };
}

/**
 * Retrieve the merkle proof for a transaction.
 * @param txId - The transaction ID in string format.
 * @returns A promise that resolves into the merkle proof.
 */
export async function getTxMerkleProof(txId: string): Promise<MerkleProof> {
  const response = await fetchApi<{
    block_height: number;
    merkle: string[];
    pos: number;
  }>(txMerkleProofUrl(txId));

  const { block_height, merkle, pos } = response;

  // Check if the response or the merkle proof is empty.
  // An empty merkle proof usually means the transaction is not found or not confirmed yet.
  if (!block_height || !merkle.length || !pos) {
    throw new ClientError(
      ERROR_CODES.TRANSACTION_VERIFICATION_ERROR,
      `Transaction not found or not confirmed when fetching Merkle proof: ${txId}`,
    );
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
  const response = await fetchApi<string>(txHexUrl(txId), {
    // return the response as a string
    parseAs: "text",
  });
  return response;
}

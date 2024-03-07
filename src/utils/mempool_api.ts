import { UTXO } from "./btcstaking";

const mempoolAPI = `${process.env.NEXT_PUBLIC_MEMPOOL_API}/signet/api/`;

function addressInfoUrl(address: String): URL {
  return new URL(mempoolAPI + "address/" + address);
}

function txInfoUrl(txid: String): URL {
  return new URL(mempoolAPI + "tx/" + txid);
}

function pushTxUrl(): URL {
  return new URL(mempoolAPI + "tx");
}

function utxosInfoUrl(address: String): URL {
  return new URL(mempoolAPI + "address/" + address + "/utxo");
}

function transactionStatusURL(txID: String): URL {
  return new URL(`${mempoolAPI}tx/${txID}/status`);
}

function blockTipURL(): URL {
  return new URL(`${mempoolAPI}blocks/tip/height`);
}

export async function broadcastTransaction(txhex: string): Promise<string> {
  const response = await fetch(pushTxUrl(), {
    method: "POST",
    body: txhex,
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

export async function getAddressBalance(address: String): Promise<number> {
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

export async function getTip(): Promise<number> {
  const response = await fetch(blockTipURL());
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  } else {
    return await response.json();
  }
}

export async function getTransactionStatus(
  txID: string,
): Promise<{ txID: string; blockHeight: number }> {
  const response = await fetch(transactionStatusURL(txID));
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  } else {
    const data = await response.json();
    return { txID, blockHeight: data?.block_height || 0 };
  }
}

// Get available UTXOs in order to find a set of those that satisfy
// the `amount` requirement.
export async function getFundingUTXOs(
  address: String,
  amount: number,
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

  // Reduce the list of UTXOs into a list that contains just enough
  // UTXOs to satisfy the `amount` requirement.
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
  const sliced = confirmedUTXOs.slice(0, i + 1);

  // Iterate through the final list of UTXOs to construct the result list.
  // The result contains some extra information,
  var result = [];
  for (var i = 0; i < sliced.length; ++i) {
    const response = await fetch(txInfoUrl(sliced[i].txid));
    const transactionInfo = await response.json();
    result.push({
      txid: sliced[i].txid,
      vout: sliced[i].vout,
      value: sliced[i].value,
      scriptPubKey: transactionInfo.vout[sliced[i].vout].scriptpubkey,
    });
  }
  return result;
}

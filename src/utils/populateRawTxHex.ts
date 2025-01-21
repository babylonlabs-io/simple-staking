import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { payments } from "bitcoinjs-lib";

function guessScriptType(scriptHex: string): string {
  const script = Buffer.from(scriptHex, "hex");

  try {
    payments.p2pkh({ output: script });
    return "pubkeyhash";
  } catch {}
  try {
    payments.p2sh({ output: script });
    return "scripthash";
  } catch {}
  // ... etc if you want
  return "other"; // i.e. witness or taproot
}

function needsRawTxHex(scriptPubKeyHex: string): boolean {
  const t = guessScriptType(scriptPubKeyHex);
  return t === "pubkeyhash" || t === "scripthash";
}

async function fetchTxHexFromMempoolSignet(txid: string): Promise<string> {
  const url = `https://mempool.space/signet/api/tx/${txid}/hex`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch tx hex for ${txid}: ${res.status} ${res.statusText}`,
    );
  }
  return res.text();
}

/**
 * Enrich any legacy/nested UTXOs by fetching rawTxHex from mempool.space
 */
export async function populateRawTxHexForLegacyUtxos(
  utxos: UTXO[],
): Promise<UTXO[]> {
  // Make a copy or mutate in place
  const updated = [...utxos];
  for (const utxo of updated) {
    if (needsRawTxHex(utxo.scriptPubKey) && !utxo.rawTxHex) {
      // do your fetch
      utxo.rawTxHex = await fetchTxHexFromMempoolSignet(utxo.txid);
    }
  }
  return updated;
}

import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { payments } from "bitcoinjs-lib";

/**
 * Detect the script type by attempting different bitcoinjs-lib payment types.
 * Returns a string like "pubkeyhash", "scripthash", "witnesspubkeyhash", etc.
 */
function guessScriptType(script: Buffer): string {
  // Try P2PKH
  try {
    payments.p2pkh({ output: script });
    return "pubkeyhash";
  } catch {}

  // Try P2SH
  try {
    payments.p2sh({ output: script });
    return "scripthash";
  } catch {}

  // Try P2WPKH
  try {
    payments.p2wpkh({ output: script });
    return "witnesspubkeyhash";
  } catch {}

  // Try P2WSH
  try {
    payments.p2wsh({ output: script });
    return "witnessscripthash";
  } catch {}

  // Try P2TR
  try {
    payments.p2tr({ output: script });
    return "taproot";
  } catch {}

  throw new Error("Unknown script type");
}

/**
 * Returns true if the script type is legacy P2PKH or P2SH,
 * which both require nonWitnessUtxo (rawTxHex) per BIP174.
 */
function needsRawTxHex(scriptPubKeyHex: string): boolean {
  const t = guessScriptType(Buffer.from(scriptPubKeyHex, "hex"));
  return t === "pubkeyhash" || t === "scripthash";
}

/**
 * Fetch raw transaction hex from mempool.space on Signet.
 * @param txid - The transaction ID to fetch.
 * @returns A promise that resolves to the raw tx hex as a string.
 */
async function fetchTxHexFromMempoolSignet(txid: string): Promise<string> {
  const url = `https://mempool.space/signet/api/tx/${txid}/hex`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch tx hex for ${txid}: ${res.status} ${res.statusText}`,
    );
  }
  return res.text(); // This will be the raw hex string
}

/**
 * Fetch rawTxHex from mempool.space for any UTXO that is P2PKH or P2SH
 * and doesn't already have rawTxHex.
 *
 * After calling this, each UTXO that needs a full nonWitnessUtxo
 * will have its `rawTxHex` populated.
 */
export async function populateRawTxHexForLegacyUtxos(
  utxos: UTXO[],
): Promise<UTXO[]> {
  const updatedUtxos: UTXO[] = [];
  for (const utxo of utxos) {
    if (needsRawTxHex(utxo.scriptPubKey) && !utxo.rawTxHex) {
      // Download the raw tx hex from mempool.space
      utxo.rawTxHex = await fetchTxHexFromMempoolSignet(utxo.txid);
    }
    updatedUtxos.push(utxo);
  }
  return updatedUtxos;
}

import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { payments } from "bitcoinjs-lib";

/**
 * A local script detection, purely for deciding if we need rawTxHex.
 */
function guessScriptType(script: Buffer): string {
  try {
    payments.p2pkh({ output: script });
    return "pubkeyhash";
  } catch {}
  try {
    payments.p2sh({ output: script });
    return "scripthash";
  } catch {}
  try {
    payments.p2wpkh({ output: script });
    return "witnesspubkeyhash";
  } catch {}
  try {
    payments.p2wsh({ output: script });
    return "witnessscripthash";
  } catch {}
  try {
    payments.p2tr({ output: script });
    return "taproot";
  } catch {}
  return "unknown";
}

/**
 * Returns true if the script type is legacy P2PKH or P2SH,
 * which both require nonWitnessUtxo (rawTxHex) per BIP174.
 */
function needsRawTxHex(scriptPubKeyHex: string): boolean {
  const scriptType = guessScriptType(Buffer.from(scriptPubKeyHex, "hex"));
  return scriptType === "pubkeyhash" || scriptType === "scripthash";
}

/** Fetch raw tx from mempool.space on signet (replace if mainnet, testnet, etc). */
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
 * If a UTXO is legacy (P2PKH) or P2SH and missing rawTxHex,
 * fetch it from mempool.space and populate `utxo.rawTxHex`.
 */
export async function populateRawTxHexForLegacyUtxos(
  utxos: UTXO[],
): Promise<UTXO[]> {
  for (const utxo of utxos) {
    if (needsRawTxHex(utxo.scriptPubKey) && !utxo.rawTxHex) {
      utxo.rawTxHex = await fetchTxHexFromMempoolSignet(utxo.txid);
    }
  }
  return utxos;
}

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
 * If the user’s wallet is standard P2SH–P2WPKH, we can compute the redeem script
 * from the user’s 33-byte compressed pubkey.
 */
function maybeComputeP2shP2wpkhRedeemScript(utxo: UTXO, userPubkey: Buffer) {
  const script = Buffer.from(utxo.scriptPubKey, "hex");
  const type = guessScriptType(script);

  // If scriptPubKey is P2SH & no custom redeemScript is present, try to build it
  if (type === "scripthash" && !utxo.redeemScript) {
    // We assume standard nested segwit.
    // 1) Create p2wpkh with your user pubkey
    const p2wpkh = payments.p2wpkh({ pubkey: userPubkey });

    // 2) The p2wpkh.output is `0x00 0x14 <20-byte-hash160(pubkey)>`
    if (!p2wpkh.output) throw new Error("Could not build p2wpkh output");
    // 3) That’s the redeem script for a P2SH–P2WPKH
    utxo.redeemScript = p2wpkh.output.toString("hex");
  }
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
  userPubkey?: Buffer,
): Promise<UTXO[]> {
  for (const utxo of utxos) {
    // 1) If needed, fetch rawTxHex
    if (needsRawTxHex(utxo.scriptPubKey) && !utxo.rawTxHex) {
      utxo.rawTxHex = await fetchTxHexFromMempoolSignet(utxo.txid);
    }
    // 2) If scriptPubKey is p2sh & we have not set redeemScript
    //    but we do have user pubkey => build it
    if (userPubkey) {
      maybeComputeP2shP2wpkhRedeemScript(utxo, userPubkey);
    }
  }
  return utxos;
}

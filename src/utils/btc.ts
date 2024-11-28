/**
 * Converts satoshis to BTC.
 * should be used internally in the app
 * @param satoshi The amount in satoshis.
 * @returns The equivalent amount in BTC.
 */
export function satoshiToBtc(satoshi: number): number {
  return satoshi / 1e8;
}

/**
 * Converts BTC to satoshis.
 * should be used only in the UI
 * @param btc The amount in BTC.
 * @returns The equivalent amount in satoshis.
 */
export function btcToSatoshi(btc: number): number {
  return Math.round(btc * 1e8);
}

/**
 * Derives the merkle proof from the list of hex strings. Note the
 * sibling hashes are reversed from hex before concatenation.
 * @param merkle - The merkle proof hex strings.
 * @returns The merkle proof in hex string format.
 */
export const deriveMerkleProof = (merkle: string[]) => {
  const proofHex = merkle.reduce((acc: string, m: string) => {
    return acc + Buffer.from(m, "hex").reverse().toString("hex");
  }, "");
  return proofHex;
};

/**
 * Converts BBN to uBBN (micro BBN).
 * should be used internally in the app
 * @param bbn The amount in BBN.
 * @returns The equivalent amount in uBBN.
 */
export function bbnToUbbn(bbn: number): number {
  return Math.round(bbn * 1e6);
}

/**
 * Converts uBBN (micro BBN) to BBN.
 * should be used only in the UI
 * @param ubbn The amount in uBBN.
 * @returns The equivalent amount in BBN.
 */
export function ubbnToBbn(ubbn: number): number {
  return ubbn / 1e6;
}

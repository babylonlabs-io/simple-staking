/**
 * Converts BABY to uBBN (micro BABY).
 * should be used internally in the app
 * @param bbn The amount in BABY.
 * @returns The equivalent amount in uBBN.
 */
export function babyToUbbn(bbn: number): number {
  return Math.round(bbn * 1e6);
}

/**
 * Converts uBBN (micro BABY) to BABY.
 * should be used only in the UI
 * @param ubbn The amount in uBBN.
 * @returns The equivalent amount in BABY.
 */
export function ubbnToBaby(ubbn: number): number {
  return ubbn / 1e6;
}

/**
 * Converts a coin amount string to BigInt, safely handling decimal values.
 * Used for financial calculations involving BBN rewards and amounts.
 * @param amount The coin amount as a string.
 * @returns The amount as BigInt, floored to remove decimal precision.
 */
export function coinAmountToBigInt(amount: string): bigint {
  return BigInt(Math.floor(Number(amount)));
}

/**
 * Safely converts BABY amount to micro-BABY (uBBN) as BigInt for validation comparisons.
 * Handles decimal values by flooring to prevent BigInt conversion errors.
 * @param babyAmount The amount in BABY (can be decimal).
 * @returns The equivalent amount in micro-BABY as BigInt.
 */
export function safeBabyToUbbnBigInt(babyAmount: number): bigint {
  const microBabyAmount = Math.floor(babyAmount * 1_000_000);
  return BigInt(microBabyAmount);
}

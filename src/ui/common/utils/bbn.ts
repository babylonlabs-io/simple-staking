// Constants
export const MICRO_BABY_PER_BABY = 1_000_000;

/**
 * Converts BABY to uBBN (micro BABY).
 * should be used internally in the app
 * @param bbn The amount in BABY.
 * @returns The equivalent amount in uBBN.
 */
export function babyToUbbn(bbn: number): number {
  return Math.round(bbn * MICRO_BABY_PER_BABY);
}

/**
 * Converts uBBN (micro BABY) to BABY.
 * should be used only in the UI
 * @param ubbn The amount in uBBN.
 * @returns The equivalent amount in BABY.
 */
export function ubbnToBaby(ubbn: number): number {
  return ubbn / MICRO_BABY_PER_BABY;
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
 * Converts BABY amount to micro-BABY (uBBN) as BigInt using rounding.
 * This matches the conversion behavior used in form transformations and transactions.
 * Use this for validation that needs to match actual transaction amounts.
 * @param babyAmount The amount in BABY (can be decimal).
 * @returns The equivalent amount in micro-BABY as BigInt.
 */
export function babyToUbbnBigInt(babyAmount: number): bigint {
  const microBabyAmount = Math.round(babyAmount * MICRO_BABY_PER_BABY);
  return BigInt(microBabyAmount);
}

/**
 * Creates a minimum amount validation helper.
 * @param minBabyAmount The minimum amount in BABY units.
 * @returns A function that validates if a BABY amount meets the minimum requirement.
 */
export function createMinAmountValidator(minBabyAmount: number) {
  const minMicroBaby = BigInt(minBabyAmount * MICRO_BABY_PER_BABY);
  return (babyAmount: number): boolean => {
    const valueInMicroBaby = babyToUbbnBigInt(babyAmount);
    return valueInMicroBaby >= minMicroBaby;
  };
}

/**
 * Creates a balance validation helper.
 * @param availableBalance The available balance in micro-BABY (BigInt).
 * @returns A function that validates if a BABY amount doesn't exceed the balance.
 */
export function createBalanceValidator(availableBalance: bigint) {
  return (babyAmount: number): boolean => {
    const valueInMicroBaby = babyToUbbnBigInt(babyAmount);
    return valueInMicroBaby <= availableBalance;
  };
}

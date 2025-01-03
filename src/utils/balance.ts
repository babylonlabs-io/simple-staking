export interface Balance {
  amount: number;
  isValid: boolean;
}

/**
 * Validates a balance value ensuring it's defined and non-negative
 * @param balance - The balance to validate
 * @returns Balance object with validation status
 */
export function validateBalance(balance: number | undefined): Balance {
  if (balance === undefined || Number.isNaN(balance)) {
    throw new Error("Balance error: Balance amount is undefined or invalid");
  }

  if (balance < 0) {
    throw new Error("Balance error: Balance amount cannot be negative");
  }

  return { amount: balance, isValid: true };
}

/**
 * Safely calculates total balance using BigInt to prevent overflow
 * @param btcBalance - BTC balance amount
 * @param stakedBalance - Staked balance amount
 * @returns Combined total balance
 */
export function calculateTotalBalance(
  btcBalance: number | undefined,
  stakedBalance: number,
): number {
  try {
    const validatedBtcBalance = validateBalance(btcBalance);
    const validatedStakedBalance = validateBalance(stakedBalance);

    // Use BigInt for safe integer arithmetic
    const total =
      BigInt(validatedBtcBalance.amount) +
      BigInt(validatedStakedBalance.amount);

    // Check for overflow
    if (total > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error("Balance error: Balance overflow detected");
    }

    return Number(total);
  } catch (error) {
    throw new Error(`Balance error: ${error}`);
  }
}

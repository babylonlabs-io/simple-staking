import { maxDecimals } from "./maxDecimals";

/**
 * Formats a commission value (decimal) as a percentage string.
 *
 * @param commission The commission value as a decimal (e.g., 0.05 for 5%)
 * @returns The formatted commission percentage string (e.g., "5.00%")
 *
 * @example
 * formatCommissionPercentage(0.05);    // returns "5.00%"
 * formatCommissionPercentage(0.1234);  // returns "12.34%"
 * formatCommissionPercentage(0);       // returns "0.00%"
 */
export function formatCommissionPercentage(commission: number): string {
  return `${maxDecimals(commission * 100, 2)}%`;
}

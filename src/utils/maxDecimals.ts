import { Decimal } from "decimal.js-light";
/**
 * Limits the number of decimal places of a given number to a specified maximum.
 *
 * @param value The original number that you want to limit the decimal places for.
 * @param maxDecimals The maximum number of decimal places that the result should have.
 * @returns The number rounded to the specified number of decimal places.
 *
 * @example
 * maxDecimals(3.14159, 2);         // returns 3.14
 * maxDecimals(1.005, 2);           // returns 1.01
 * maxDecimals(10, 0);              // returns 10
 * maxDecimals(0.00010000, 8);      // returns 0.0001
 * maxDecimals(0.00010000, 8);      // returns 0.0001
 * maxDecimals(3.141, 3);           // returns 3.141
 * maxDecimals(3.149, 3);           // returns 3.149
 */
export const maxDecimals = (value: number, maxDecimals: number): number => {
  return new Decimal(value).toDecimalPlaces(maxDecimals).toNumber();
};

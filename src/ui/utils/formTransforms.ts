import { btcToSatoshi } from "@/ui/utils/btc";

/**
 * Transform function for staking amount field in forms.
 * Converts BTC amount to satoshi, or returns undefined if invalid.
 * Used in yup validation schemas.
 *
 * @param value - The numeric value to transform
 * @returns The amount in satoshi or undefined if invalid
 */
export const formatStakingAmount = (value: number) =>
  !Number.isNaN(value) ? btcToSatoshi(value) : undefined;

/**
 * Transform function for numeric fields in forms.
 * Returns the number if valid, or undefined if invalid.
 * Used in yup validation schemas.
 *
 * @param value - The numeric value to transform
 * @returns The number or undefined if invalid
 */
export const formatNumber = (value: number) =>
  !Number.isNaN(value) ? value : undefined;

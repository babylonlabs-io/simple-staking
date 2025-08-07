import { UTXO } from "@babylonlabs-io/btc-staking-ts";

import { isUTXOSpent } from "@/ui/common/utils/mempool_api";

/**
 * Simple service for validating UTXO availability to prevent mempool conflicts.
 * Focuses on checking if UTXOs are still unspent before transaction creation.
 */
export class UTXOValidationService {
  /**
   * Checks if a single UTXO is still unspent by querying the mempool.
   * @param utxo - The UTXO to validate
   * @returns Promise<boolean> - true if UTXO is still available, false if spent
   */
  async isUTXOAvailable(utxo: UTXO): Promise<boolean> {
    // Check if the UTXO is spent (returns true if spent, false if available)
    const isSpent = await isUTXOSpent(utxo.txid, utxo.vout);
    return !isSpent;
  }

  /**
   * Validates UTXOs and filters out those that are already spent.
   * Simple implementation focused on staking expansion use case.
   * @param utxos - Array of UTXOs to validate
   * @returns Promise<UTXO[]> - Array containing only unspent UTXOs
   */
  async validateUTXOs(utxos: UTXO[]): Promise<UTXO[]> {
    if (!utxos || utxos.length === 0) {
      return [];
    }

    try {
      const validUTXOs: UTXO[] = [];

      // Process UTXOs sequentially to avoid overwhelming the API
      for (const utxo of utxos) {
        try {
          const isAvailable = await this.isUTXOAvailable(utxo);
          if (isAvailable) {
            validUTXOs.push(utxo);
          }
        } catch (error) {
          // Skip UTXOs we can't validate, but don't fail entirely
          console.warn(
            `Failed to validate UTXO ${utxo.txid}:${utxo.vout}, skipping`,
            error,
          );
        }
      }

      return validUTXOs;
    } catch (error) {
      // If validation fails entirely, return original UTXOs as fallback
      console.warn("UTXO validation failed, returning original UTXOs", error);
      return utxos;
    }
  }
}

// Singleton instance for the service
export const utxoValidationService = new UTXOValidationService();

/**
 * Convenience function to validate UTXOs for staking expansion.
 * @param utxos - Array of UTXOs to validate
 * @returns Promise<UTXO[]> - Array containing only unspent UTXOs
 */
export const validateUTXOs = (utxos: UTXO[]): Promise<UTXO[]> => {
  return utxoValidationService.validateUTXOs(utxos);
};

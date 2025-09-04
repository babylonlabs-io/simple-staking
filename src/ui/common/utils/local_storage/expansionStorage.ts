import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/common/types/delegationsV2";

import { getExpansionsLocalStorageKey } from "./getExpansionsLocalStorageKey";

/**
 * Helper function to remove an item from a localStorage record.
 * This centralizes the localStorage record manipulation pattern used throughout the file.
 *
 * @param storageKey - The localStorage key
 * @param itemId - The ID of the item to remove from the record
 */
function removeFromLocalStorageRecord(
  storageKey: string,
  itemId: string,
): void {
  try {
    const data = localStorage.getItem(storageKey);
    if (data) {
      const record = JSON.parse(data);
      if (record[itemId]) {
        delete record[itemId];
        localStorage.setItem(storageKey, JSON.stringify(record));
      }
    }
  } catch (error) {
    console.error(
      `Failed to remove item from localStorage key ${storageKey}:`,
      error,
    );
  }
}

/**
 * Mark an expansion as broadcasted by updating its status to INTERMEDIATE_PENDING_BTC_CONFIRMATION.
 * This is called after a verified expansion is successfully signed and broadcasted to Bitcoin.
 *
 * @param expansionTxHashHex - The transaction hash of the expansion to mark as broadcasted
 * @param publicKeyNoCoord - The public key of the wallet
 */
export function markExpansionAsBroadcasted(
  expansionTxHashHex: string,
  publicKeyNoCoord: string | undefined,
): void {
  if (!publicKeyNoCoord) {
    console.warn(
      "Cannot mark expansion as broadcasted: no public key provided",
    );
    return;
  }

  const storageKey = getExpansionsLocalStorageKey(publicKeyNoCoord);
  const statusesKey = `${storageKey}_statuses`;

  try {
    // Get existing statuses from localStorage
    const existingStatuses = localStorage.getItem(statusesKey);
    const statuses = existingStatuses ? JSON.parse(existingStatuses) : {};

    // Update the status for this expansion
    statuses[expansionTxHashHex] =
      DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION;

    // Save back to localStorage
    localStorage.setItem(statusesKey, JSON.stringify(statuses));
  } catch (error) {
    console.error("Failed to mark expansion as broadcasted:", error);
  }
}

/**
 * Get all broadcasted expansions from localStorage.
 * Broadcasted expansions are those with INTERMEDIATE_PENDING_BTC_CONFIRMATION status.
 *
 * @param publicKeyNoCoord - The public key of the wallet
 * @param expansions - The list of expansions to check against localStorage
 * @returns Array of expansions that have been broadcasted
 */
export function getBroadcastedExpansions(
  publicKeyNoCoord: string | undefined,
  expansions: DelegationV2[],
): DelegationV2[] {
  if (!publicKeyNoCoord || !expansions || expansions.length === 0) {
    return [];
  }

  const storageKey = getExpansionsLocalStorageKey(publicKeyNoCoord);
  const statusesKey = `${storageKey}_statuses`;

  try {
    // Get statuses from localStorage
    const storedStatuses = localStorage.getItem(statusesKey);
    if (!storedStatuses) {
      return [];
    }

    const statuses = JSON.parse(storedStatuses);

    // Filter expansions to only include those marked as broadcasted
    return expansions.filter(
      (expansion) =>
        statuses[expansion.stakingTxHashHex] ===
        DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION,
    );
  } catch (error) {
    console.error("Failed to get broadcasted expansions:", error);
    return [];
  }
}

/**
 * Clean up a broadcasted expansion from localStorage when it becomes ACTIVE.
 * This is called when an expansion transitions from broadcasted to confirmed on-chain.
 *
 * @param expansionTxHashHex - The transaction hash of the expansion to clean up
 * @param publicKeyNoCoord - The public key of the wallet
 */
export function cleanupActiveExpansion(
  expansionTxHashHex: string,
  publicKeyNoCoord: string | undefined,
): void {
  if (!publicKeyNoCoord) {
    return;
  }

  const storageKey = getExpansionsLocalStorageKey(publicKeyNoCoord);
  const pendingKey = `${storageKey}_pending`;
  const statusesKey = `${storageKey}_statuses`;

  // Remove from pending delegations
  removeFromLocalStorageRecord(pendingKey, expansionTxHashHex);

  // Remove from statuses
  removeFromLocalStorageRecord(statusesKey, expansionTxHashHex);
}

/**
 * Check if an expansion has been broadcasted.
 * This is a convenience function that checks if the expansion has
 * INTERMEDIATE_PENDING_BTC_CONFIRMATION status in localStorage.
 *
 * @param expansionTxHashHex - The transaction hash to check
 * @param publicKeyNoCoord - The public key of the wallet
 * @returns true if the expansion has been broadcasted, false otherwise
 */
export function isExpansionBroadcasted(
  expansionTxHashHex: string,
  publicKeyNoCoord: string | undefined,
): boolean {
  if (!publicKeyNoCoord) {
    return false;
  }

  const storageKey = getExpansionsLocalStorageKey(publicKeyNoCoord);
  const statusesKey = `${storageKey}_statuses`;

  try {
    const statusesData = localStorage.getItem(statusesKey);
    if (!statusesData) {
      return false;
    }

    const statuses = JSON.parse(statusesData);
    return (
      statuses[expansionTxHashHex] ===
      DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION
    );
  } catch (error) {
    console.error("Failed to check if expansion is broadcasted:", error);
    return false;
  }
}

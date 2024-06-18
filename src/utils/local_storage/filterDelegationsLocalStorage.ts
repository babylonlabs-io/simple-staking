import { Delegation } from "@/app/types/delegations";

import { getTxInfo } from "../mempool_api";

// Duration after which a delegation should be removed from the local storage
// if not identified by the API or mempool.
const maxDelegationPendingDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Filter delegations from the local storage
// Returns the delegations that are valid and should be kept in the local storage
export const filterDelegationsLocalStorage = async (
  delegationsLocalStorage: Delegation[],
  delegationsFromAPI: Delegation[],
): Promise<Delegation[]> => {
  const validDelegations: Delegation[] = [];

  // `continue` will not add the delegation to the validDelegations array
  for (const localDelegation of delegationsLocalStorage) {
    // Check if the delegation is already present in the API
    const delegationInAPI = delegationsFromAPI.find(
      (delegation) =>
        delegation?.stakingTxHashHex === localDelegation?.stakingTxHashHex,
    );

    if (delegationInAPI) {
      continue;
    }

    // Check if the delegation has exceeded the max duration
    const startTimestamp = new Date(
      localDelegation.stakingTx.startTimestamp,
    ).getTime();
    const currentTime = Date.now();
    const hasExceededDuration =
      currentTime - startTimestamp > maxDelegationPendingDuration;

    if (hasExceededDuration) {
      // We are removing the delegation from the local storage
      // only if it has exceeded the max duration and is not in the mempool
      // otherwise (low fees as example), we keep it in the local storage

      // Check if the transaction is in the mempool
      let isInMempool = true;
      try {
        const fetchedTx = await getTxInfo(localDelegation.stakingTxHashHex);
        if (!fetchedTx) {
          throw new Error("Transaction not found in the mempool");
        }
      } catch (_error) {
        isInMempool = false;
      }

      if (!isInMempool) {
        continue;
      }
    }

    validDelegations.push(localDelegation);
  }

  return validDelegations;
};

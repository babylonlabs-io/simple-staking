import { Delegation } from "@/app/types/delegations";

import { filterDelegationsLocalStorage } from "./filterDelegationsLocalStorage";

export const calculateDelegationsDiff = async (
  delegations: Delegation[],
  delegationsLocalStorage: Delegation[],
): Promise<{ areDelegationsDifferent: boolean; delegations: Delegation[] }> => {
  // Filter the delegations that are still valid
  const validDelegationsLocalStorage = await filterDelegationsLocalStorage(
    delegationsLocalStorage,
    delegations,
  );

  // Extract the stakingTxHashHex
  const validDelegationsHashes = validDelegationsLocalStorage
    .map((delegation) => delegation.stakingTxHashHex)
    .sort();
  const delegationsLocalStorageHashes = delegationsLocalStorage
    .map((delegation) => delegation.stakingTxHashHex)
    .sort();

  // Check if the validDelegations are different from the current delegationsLocalStorage
  const areDelegationsDifferent =
    validDelegationsHashes.length !== delegationsLocalStorageHashes.length ||
    validDelegationsHashes.some(
      (hash, index) => hash !== delegationsLocalStorageHashes[index],
    );

  return {
    areDelegationsDifferent,
    delegations: validDelegationsLocalStorage,
  };
};

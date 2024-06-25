import { Delegation } from "@/app/types/delegations";

import { filterDelegationsLocalStorage } from "./filterDelegationsLocalStorage";

export const updateDelegations = async (
  delegations: Delegation[],
  delegationsLocalStorage: Delegation[],
  setDelegationsLocalStorage: (delegations: Delegation[]) => void,
) => {
  // Filter the delegations that are still valid
  const validDelegations = await filterDelegationsLocalStorage(
    delegationsLocalStorage,
    delegations,
  );

  // Extract the stakingTxHashHex from the validDelegations
  const validDelegationsHashes = validDelegations
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
  console.log("areDelegationsDifferent", areDelegationsDifferent);

  // Update the local storage delegations if they are different to avoid unnecessary updates
  if (areDelegationsDifferent) {
    setDelegationsLocalStorage(validDelegations);
  }
};

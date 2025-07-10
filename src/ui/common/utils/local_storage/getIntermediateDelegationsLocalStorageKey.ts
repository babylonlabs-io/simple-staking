const INTERMEDIAGE_DELEGATIONS_KEY = "bbn-staking-intermediate-delegations";

// Get the local storage key for delegations
export const getIntermediateDelegationsLocalStorageKey = (pk: string) => {
  return pk ? `${INTERMEDIAGE_DELEGATIONS_KEY}-${pk}` : "";
};

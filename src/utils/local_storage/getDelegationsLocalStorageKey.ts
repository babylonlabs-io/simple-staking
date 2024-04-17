const DELEGATIONS_KEY = "bbn-staking-delegations";

// Get the local storage key for delegations
export const getDelegationsLocalStorageKey = (pk: string) => {
  return pk ? `${DELEGATIONS_KEY}-${pk}` : "";
};

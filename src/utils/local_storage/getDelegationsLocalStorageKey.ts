const DELEGATIONS_KEY = "bbn-staking-delegations";

// Get the local storage key for delegations
export const getDelegationsLocalStorageKey = (pk: string) => {
  return pk ? `${DELEGATIONS_KEY}-${pk}` : "";
};

// Get the local storage key for phase-2 delegations
export const getDelegationsV2LocalStorageKey = (pk: string) => {
  return pk ? `${DELEGATIONS_KEY}-v2-${pk}` : "";
};

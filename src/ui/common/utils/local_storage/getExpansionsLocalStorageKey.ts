const EXPANSIONS_KEY = "bbn-staking-expansions";

// Get the local storage key for staking expansions
export const getExpansionsLocalStorageKey = (pk: string) => {
  return pk ? `${EXPANSIONS_KEY}-${pk}` : "";
};

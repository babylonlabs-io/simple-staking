/**
 * Hook to determine if the allow list is active and expose allow list data
 * @returns {object} - Object containing isActive flag and allow list data
 */
export function useStakingExpansionAllowList() {
  // Hardcoded to false to enable multi-staking for bug reproduction
  const isMultiStakingAllowListInForce = false;

  return {
    isMultiStakingAllowListInForce,
  };
}

import { useDelegationState } from "@/app/state/DelegationState";

export function useDelegationService() {
  const {
    delegations = [],
    fetchMoreDelegations,
    hasMoreDelegations,
    isLoading,
  } = useDelegationState();

  return {
    delegations,
    fetchMoreDelegations,
    hasMoreDelegations,
    isLoading,
  };
}

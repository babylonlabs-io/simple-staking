import { DelegationState } from "@/app/types/delegationState";

// Convert state to human readable format
export const getState = (state: string) => {
  switch (state) {
    case DelegationState.ACTIVE:
      return "Active";
    case DelegationState.UNBONDING_REQUESTED:
      return "Unbonding Requested";
    case DelegationState.UNBONDING:
      return "Unbonding";
    case DelegationState.UNBONDED:
      return "Unbonded";
    case DelegationState.WITHDRAWN:
      return "Withdrawn";
    case DelegationState.PENDING:
      return "Pending";
    case DelegationState.OVERFLOW:
      return "Overflow";
    // Intermediate local storage states
    case DelegationState.INTERMEDIATE_UNBONDING:
      return "Unbonding";
    case DelegationState.INTERMEDIATE_WITHDRAWAL:
      return "Withdrawing";
    default:
      return "Unknown";
  }
};

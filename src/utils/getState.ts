import { DelegationState } from "@/app/types/delegations";

import { blocksToDisplayTime } from "./blocksToDisplayTime";

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
    case DelegationState.EXPIRED:
      return "Expired";
    // Intermediate local storage states
    case DelegationState.INTERMEDIATE_UNBONDING:
      return "Requesting Unbonding";
    case DelegationState.INTERMEDIATE_WITHDRAWAL:
      return "Withdrawal Submitted";
    default:
      return "Unknown";
  }
};

// Create state tooltips for the additional information
export const getStateTooltip = (
  state: string,
  params?: { confirmationDepth: number; unbondingTime: number },
) => {
  switch (state) {
    case DelegationState.ACTIVE:
      return "Stake is active";
    case DelegationState.UNBONDING_REQUESTED:
      return "Unbonding requested";
    case DelegationState.UNBONDING:
      return `Unbonding process of ${blocksToDisplayTime(params?.unbondingTime)} has started`;
    case DelegationState.UNBONDED:
      return "Stake has been unbonded";
    case DelegationState.WITHDRAWN:
      return "Stake has been withdrawn";
    case DelegationState.PENDING:
      return `Stake that is pending ${params?.confirmationDepth || 10} Bitcoin confirmations will only be visible from this device`;
    case DelegationState.OVERFLOW:
      return "Stake is over the staking cap";
    case DelegationState.EXPIRED:
      return "Stake timelock has expired";
    // Intermediate local storage states
    case DelegationState.INTERMEDIATE_UNBONDING:
      return "Stake is requesting unbonding";
    case DelegationState.INTERMEDIATE_WITHDRAWAL:
      return "Withdrawal transaction pending confirmation on Bitcoin";
    default:
      return "Unknown";
  }
};

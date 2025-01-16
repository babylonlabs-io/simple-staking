import { DelegationState } from "@/app/types/delegations";
import { getNetworkConfigBBN } from "@/config/network/bbn";

const { networkFullName: bbnNetworkFullName } = getNetworkConfigBBN();

// Convert state to human readable format
export const getState = (state: string) => {
  switch (state) {
    case DelegationState.ACTIVE:
      return "Pending Registration";
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
    case DelegationState.INTERMEDIATE_TRANSITIONING:
      return "Active/Pending Registration";
    case DelegationState.TRANSITIONED:
      return "Transitioned";
    default:
      return "Unknown";
  }
};

// Create state tooltips for the additional information
export const getStateTooltip = (state: string) => {
  switch (state) {
    case DelegationState.ACTIVE:
      return "Stake is pending registration to the Babylon chain";
    case DelegationState.UNBONDING_REQUESTED:
      return "Stake is requesting unbonding";
    case DelegationState.UNBONDED:
      return "Stake has been unbonded";
    case DelegationState.WITHDRAWN:
      return "Stake has been withdrawn";
    case DelegationState.OVERFLOW:
      return "Stake is over the staking cap";
    case DelegationState.EXPIRED:
      return "Stake timelock has expired";
    // Intermediate local storage states
    case DelegationState.INTERMEDIATE_UNBONDING:
      return "Stake is requesting unbonding";
    case DelegationState.INTERMEDIATE_WITHDRAWAL:
      return "Withdrawal transaction pending confirmation on Bitcoin";
    case DelegationState.INTERMEDIATE_TRANSITIONING:
      return `Stake is pending registration to the ${bbnNetworkFullName} network`;
    case DelegationState.TRANSITIONED:
      return `Stake has been transitioned to the ${bbnNetworkFullName} network`;
    default:
      return "Unknown";
  }
};

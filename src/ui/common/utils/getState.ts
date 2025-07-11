import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { DelegationState } from "@/ui/common/types/delegations";

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
      return "Your Finality Provider is registered on Babylon Genesis";
    case DelegationState.UNBONDING_REQUESTED:
      return "Stake unbonding is in progress";
    case DelegationState.UNBONDED:
      return "Stake has been unbonded";
    case DelegationState.WITHDRAWN:
      return "Stake has been withdrawn";
    case DelegationState.OVERFLOW:
      return "Stake was over the Phase-1 staking cap it was created in";
    case DelegationState.EXPIRED:
      return "Stake timelock has expired";
    // Intermediate local storage states
    case DelegationState.INTERMEDIATE_UNBONDING:
      return "Stake unbonding is in progress";
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

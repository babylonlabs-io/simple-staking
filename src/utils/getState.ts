import {
  INTERMEDIATE_UNBONDING,
  INTERMEDIATE_WITHDRAWAL,
} from "@/app/types/local_storage/intermediate";

// Define the state of a delegation as per API
export const State = {
  active: "active",
  unbonding_requested: "unbonding_requested",
  unbonding: "unbonding",
  unbonded: "unbonded",
  withdrawn: "withdrawn",
  pending: "pending",
  INTERMEDIATE_UNBONDING,
  INTERMEDIATE_WITHDRAWAL,
};

// Convert state to human readable format
export const getState = (state: string) => {
  switch (state) {
    case State.active:
      return "Active";
    case State.unbonding_requested:
      return "Unbonding Requested";
    case State.unbonding:
      return "Unbonding";
    case State.unbonded:
      return "Unbonded";
    case State.withdrawn:
      return "Withdrawn";
    case State.pending:
      return "Pending";
    // Intermediate local storage states
    case State.INTERMEDIATE_UNBONDING:
      return "Unbonding";
    case State.INTERMEDIATE_WITHDRAWAL:
      return "Withdrawing";
    default:
      return "Unknown";
  }
};

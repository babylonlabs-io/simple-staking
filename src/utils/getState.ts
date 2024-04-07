import {
  INTERMEDIATE_UNBONDING,
  INTERMEDIATE_WITHDRAWAL,
} from "@/app/types/local_storage/intermediate";

export const getState = (state: string) => {
  switch (state) {
    case "active":
      return "Active";
    case "unbonding_requested":
      return "Unbonding Requested";
    case "unbonding":
      return "Unbonding";
    case "unbonded":
      return "Unbonded";
    case "withdrawn":
      return "Withdrawn";
    case "pending":
      return "Pending";
    // Intermediate local storage states
    case INTERMEDIATE_UNBONDING:
      return "Unbonding";
    case INTERMEDIATE_WITHDRAWAL:
      return "Withdrawing";
    default:
      return "Unknown";
  }
};

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
    case "intermediate_unbonding":
      return "Unbonding";
    case "intermediate_withdrawal":
      return "Withdrawing";
    default:
      return "Unknown";
  }
};

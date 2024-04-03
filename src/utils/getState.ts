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
    default:
      return "Unknown";
  }
};

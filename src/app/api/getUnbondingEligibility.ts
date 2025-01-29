import { ClientErrorCategory } from "../constants/errorMessages";
import { ClientError } from "../context/Error/errors/clientError";
import { ErrorState } from "../types/errors";

import { apiWrapper } from "./apiWrapper";

export const getUnbondingEligibility = async (txID: string) => {
  if (!txID) {
    throw new ClientError({
      message: "No transaction ID provided",
      category: ClientErrorCategory.CLIENT_VALIDATION,
      state: ErrorState.UNBONDING,
    });
  }

  const params = {
    staking_tx_hash_hex: txID,
  };

  const response = await apiWrapper(
    "GET",
    "/v1/unbonding/eligibility",
    "Error checking unbonding eligibility",
    { query: params },
  );

  // If the response status is 200, the unbonding is eligible
  return response.status === 200;
};

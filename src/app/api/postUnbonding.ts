import { apiWrapper } from "./apiWrapper";

export interface UnbondingPayload {
  staker_signed_signature_hex: string;
  staking_tx_hash_hex: string;
  unbonding_tx_hash_hex: string;
  unbonding_tx_hex: string;
}

export const postUnbonding = async (payload: UnbondingPayload) => {
  if (!payload) {
    throw new Error("No payload provided");
  }

  const response = await apiWrapper(
    "POST",
    "/v1/unbonding",
    "Error POST unbonding request",
    payload,
  );

  // If the response status is 202, the request was accepted
  return response.status === 202;
};

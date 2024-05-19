import { apiWrapper } from "./apiWrapper";

interface UnbondingPayload {
  staker_signed_signature_hex: string;
  staking_tx_hash_hex: string;
  unbonding_tx_hash_hex: string;
  unbonding_tx_hex: string;
}

export const postUnbonding = async (
  stakerSignedSignatureHex: string,
  stakingTxHashHex: string,
  unbondingTxHashHex: string,
  unbondingTxHex: string,
) => {
  const payload: UnbondingPayload = {
    staker_signed_signature_hex: stakerSignedSignatureHex,
    staking_tx_hash_hex: stakingTxHashHex,
    unbonding_tx_hash_hex: unbondingTxHashHex,
    unbonding_tx_hex: unbondingTxHex,
  };

  const response = await apiWrapper(
    "POST",
    "/v1/unbonding",
    "Error submitting unbonding request",
    payload,
  );

  // If the response status is 202, the request was accepted
  return response.status === 202;
};

/**
 * Mock data for unbonding API tests
 */

export const mockUnbondingParams = {
  stakerSignedSignatureHex: "mockSignature123",
  stakingTxHashHex: "mockStakingTxHash",
  unbondingTxHashHex: "mockUnbondingTxHash",
  unbondingTxHex: "mockUnbondingTxHex",
};

export const mockAcceptedResponse = {
  status: 202,
  data: {}, // Data doesn't matter for this test
};

export const mockRejectedResponse = {
  status: 200,
  data: {}, // Data doesn't matter for this test
};

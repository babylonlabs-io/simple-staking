import { apiWrapper } from "@/ui/common/api/apiWrapper";
import { postUnbonding } from "@/ui/common/api/postUnbonding";

import {
  mockAcceptedResponse,
  mockRejectedResponse,
  mockUnbondingParams,
} from "./postUnbonding.mocks";

// Mock the apiWrapper module
jest.mock("@/ui/common/api/apiWrapper");

describe("postUnbonding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true when the unbonding request is accepted", async () => {
    // Mock the apiWrapper to return a 202 status
    (apiWrapper as jest.Mock).mockResolvedValue(mockAcceptedResponse);

    // Call the function with mock parameters
    const result = await postUnbonding(
      mockUnbondingParams.stakerSignedSignatureHex,
      mockUnbondingParams.stakingTxHashHex,
      mockUnbondingParams.unbondingTxHashHex,
      mockUnbondingParams.unbondingTxHex,
    );

    // Verify apiWrapper was called with correct parameters
    expect(apiWrapper).toHaveBeenCalledWith(
      "POST",
      "/v1/unbonding",
      "Error submitting unbonding request",
      {
        body: {
          staker_signed_signature_hex:
            mockUnbondingParams.stakerSignedSignatureHex,
          staking_tx_hash_hex: mockUnbondingParams.stakingTxHashHex,
          unbonding_tx_hash_hex: mockUnbondingParams.unbondingTxHashHex,
          unbonding_tx_hex: mockUnbondingParams.unbondingTxHex,
        },
      },
    );

    // Verify the result is true
    expect(result).toBe(true);
  });

  it("returns false when the unbonding request is not accepted", async () => {
    // Mock the apiWrapper to return a non-202 status
    (apiWrapper as jest.Mock).mockResolvedValue(mockRejectedResponse);

    // Call the function with mock parameters
    const result = await postUnbonding(
      mockUnbondingParams.stakerSignedSignatureHex,
      mockUnbondingParams.stakingTxHashHex,
      mockUnbondingParams.unbondingTxHashHex,
      mockUnbondingParams.unbondingTxHex,
    );

    // Verify the result is false
    expect(result).toBe(false);
  });

  it("rethrows errors from apiWrapper", async () => {
    // Mock the apiWrapper to throw an error
    const mockError = new Error("API error");
    (apiWrapper as jest.Mock).mockRejectedValue(mockError);

    // Verify the error is rethrown
    await expect(
      postUnbonding(
        mockUnbondingParams.stakerSignedSignatureHex,
        mockUnbondingParams.stakingTxHashHex,
        mockUnbondingParams.unbondingTxHashHex,
        mockUnbondingParams.unbondingTxHex,
      ),
    ).rejects.toThrow("API error");
  });
});

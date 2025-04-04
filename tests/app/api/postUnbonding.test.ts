import { apiWrapper } from "@/app/api/apiWrapper";
import { postUnbonding } from "@/app/api/postUnbonding";

// Mock the apiWrapper module
jest.mock("@/app/api/apiWrapper");

describe("postUnbonding", () => {
  const mockParams = {
    stakerSignedSignatureHex: "mockSignature123",
    stakingTxHashHex: "mockStakingTxHash",
    unbondingTxHashHex: "mockUnbondingTxHash",
    unbondingTxHex: "mockUnbondingTxHex",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true when the unbonding request is accepted", async () => {
    // Mock the apiWrapper to return a 202 status
    (apiWrapper as jest.Mock).mockResolvedValue({
      status: 202,
      data: {}, // Data doesn't matter for this test
    });

    // Call the function with mock parameters
    const result = await postUnbonding(
      mockParams.stakerSignedSignatureHex,
      mockParams.stakingTxHashHex,
      mockParams.unbondingTxHashHex,
      mockParams.unbondingTxHex,
    );

    // Verify apiWrapper was called with correct parameters
    expect(apiWrapper).toHaveBeenCalledWith(
      "POST",
      "/v1/unbonding",
      "Error submitting unbonding request",
      {
        body: {
          staker_signed_signature_hex: mockParams.stakerSignedSignatureHex,
          staking_tx_hash_hex: mockParams.stakingTxHashHex,
          unbonding_tx_hash_hex: mockParams.unbondingTxHashHex,
          unbonding_tx_hex: mockParams.unbondingTxHex,
        },
      },
    );

    // Verify the result is true
    expect(result).toBe(true);
  });

  it("returns false when the unbonding request is not accepted", async () => {
    // Mock the apiWrapper to return a non-202 status
    (apiWrapper as jest.Mock).mockResolvedValue({
      status: 200,
      data: {}, // Data doesn't matter for this test
    });

    // Call the function with mock parameters
    const result = await postUnbonding(
      mockParams.stakerSignedSignatureHex,
      mockParams.stakingTxHashHex,
      mockParams.unbondingTxHashHex,
      mockParams.unbondingTxHex,
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
        mockParams.stakerSignedSignatureHex,
        mockParams.stakingTxHashHex,
        mockParams.unbondingTxHashHex,
        mockParams.unbondingTxHex,
      ),
    ).rejects.toThrow("API error");
  });
});

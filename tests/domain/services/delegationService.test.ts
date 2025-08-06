import {
  estimateStakeFee,
  stake,
  unstake,
} from "@/domain/services/delegationService";

// Mock babylon infrastructure
jest.mock("@/infrastructure/babylon", () => ({
  default: {
    txs: {
      baby: {
        createStakeMsg: jest.fn((params) => ({ type: "stake", ...params })),
        createUnstakeMsg: jest.fn((params) => ({ type: "unstake", ...params })),
      },
    },
    utils: {
      babyToUbbn: jest.fn((value: number) => BigInt(value * 1000000)),
    },
  },
}));

describe.skip("delegationService (domain)", () => {
  const mockSignAndBroadcast = jest.fn();
  const mockEstimateGas = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignAndBroadcast.mockResolvedValue({ txHash: "domain-test-hash" });
    mockEstimateGas.mockResolvedValue({
      amount: [{ amount: "5000" }, { amount: "3000" }],
    });
  });

  describe("stake", () => {
    it("should create stake message and broadcast", async () => {
      const params = {
        delegatorAddress: "delegator123",
        validatorAddress: "validator123",
        amount: 100,
      };

      const result = await stake(params, mockSignAndBroadcast);

      expect(result).toEqual({ txHash: "domain-test-hash" });
      expect(mockSignAndBroadcast).toHaveBeenCalledWith({
        type: "stake",
        delegatorAddress: "delegator123",
        validatorAddress: "validator123",
        amount: BigInt(100000000), // 100 BABY in ubbn
      });
    });

    it("should handle bigint amount", async () => {
      const params = {
        delegatorAddress: "delegator123",
        validatorAddress: "validator123",
        amount: BigInt(50000000), // 50 BABY in ubbn
      };

      await stake(params, mockSignAndBroadcast);

      expect(mockSignAndBroadcast).toHaveBeenCalledWith({
        type: "stake",
        delegatorAddress: "delegator123",
        validatorAddress: "validator123",
        amount: BigInt(50000000),
      });
    });

    it("should handle string amount", async () => {
      const params = {
        delegatorAddress: "delegator123",
        validatorAddress: "validator123",
        amount: "25",
      };

      await stake(params, mockSignAndBroadcast);

      expect(mockSignAndBroadcast).toHaveBeenCalledWith({
        type: "stake",
        delegatorAddress: "delegator123",
        validatorAddress: "validator123",
        amount: BigInt(25000000), // 25 BABY in ubbn
      });
    });
  });

  describe("unstake", () => {
    it("should create unstake message and broadcast", async () => {
      const params = {
        delegatorAddress: "delegator123",
        validatorAddress: "validator123",
        amount: 50,
      };

      const result = await unstake(params, mockSignAndBroadcast);

      expect(result).toEqual({ txHash: "domain-test-hash" });
      expect(mockSignAndBroadcast).toHaveBeenCalledWith({
        type: "unstake",
        delegatorAddress: "delegator123",
        validatorAddress: "validator123",
        amount: BigInt(50000000), // 50 BABY in ubbn
      });
    });
  });

  describe("estimateStakeFee", () => {
    it("should estimate fee and sum amounts", async () => {
      const params = {
        delegatorAddress: "delegator123",
        validatorAddress: "validator123",
        amount: 100,
      };

      const result = await estimateStakeFee(params, mockEstimateGas);

      expect(result).toBe(8000); // 5000 + 3000
      expect(mockEstimateGas).toHaveBeenCalledWith({
        type: "stake",
        delegatorAddress: "delegator123",
        validatorAddress: "validator123",
        amount: BigInt(100000000),
      });
    });

    it("should handle empty amount array", async () => {
      mockEstimateGas.mockResolvedValue({ amount: [] });

      const params = {
        delegatorAddress: "delegator123",
        validatorAddress: "validator123",
        amount: 100,
      };

      const result = await estimateStakeFee(params, mockEstimateGas);

      expect(result).toBe(0);
    });
  });
});

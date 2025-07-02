import { ClientError } from "@/ui/common/errors";
import { txFeeSafetyCheck } from "@/ui/common/utils/delegations/fee";

describe("txFeeSafetyCheck", () => {
  // Create a mock transaction with virtual size
  const mockTransaction = {
    virtualSize: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set a consistent virtual size for tests
    mockTransaction.virtualSize.mockReturnValue(200);
  });

  describe("with exact fee rate boundaries", () => {
    const feeRate = 10; // 10 sat/vB
    // Expected fee should be exactly virtualSize * feeRate (200 * 10 = 2000 sats)
    const exactFeeAmount = 2000; // mockTransaction.virtualSize() * feeRate

    it("should not throw when estimated fee is exactly the expected fee", () => {
      expect(() =>
        txFeeSafetyCheck(mockTransaction as any, feeRate, exactFeeAmount),
      ).not.toThrow();
    });

    it("should not throw when estimated fee is at the lower boundary", () => {
      // Lower boundary is expectedFee / 2 (2000 / 2 = 1000 sats)
      const lowerBound = exactFeeAmount / 2;
      expect(() =>
        txFeeSafetyCheck(mockTransaction as any, feeRate, lowerBound),
      ).not.toThrow();
    });

    it("should not throw when estimated fee is at the upper boundary", () => {
      // Upper boundary is expectedFee * 2 (2000 * 2 = 4000 sats)
      const upperBound = exactFeeAmount * 2;
      expect(() =>
        txFeeSafetyCheck(mockTransaction as any, feeRate, upperBound),
      ).not.toThrow();
    });

    it("should throw 'too low' error when estimated fee is below the lower boundary", () => {
      // Just below the lower boundary (1000 - 1 = 999 sats)
      const belowLowerBound = exactFeeAmount / 2 - 1;

      expect(() =>
        txFeeSafetyCheck(mockTransaction as any, feeRate, belowLowerBound),
      ).toThrow("Estimated fee is too low");

      expect(() =>
        txFeeSafetyCheck(mockTransaction as any, feeRate, belowLowerBound),
      ).toThrow(ClientError);
    });

    it("should throw 'too high' error when estimated fee is above the upper boundary", () => {
      // Just above the upper boundary (4000 + 1 = 4001 sats)
      const aboveUpperBound = exactFeeAmount * 2 + 1;

      expect(() =>
        txFeeSafetyCheck(mockTransaction as any, feeRate, aboveUpperBound),
      ).toThrow("Estimated fee is too high");

      expect(() =>
        txFeeSafetyCheck(mockTransaction as any, feeRate, aboveUpperBound),
      ).toThrow(ClientError);
    });
  });

  describe("with varying fee rates", () => {
    it("should correctly calculate fee boundaries for different fee rates", () => {
      // Test with a high fee rate
      const highFeeRate = 100; // 100 sat/vB
      const expectedHighFee = 20000; // mockTransaction.virtualSize() * highFeeRate = 200 * 100 = 20000 sats

      // Upper bound is 20000 * 2 = 40000 sats
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          highFeeRate,
          expectedHighFee * 2,
        ),
      ).not.toThrow();
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          highFeeRate,
          expectedHighFee * 2 + 1,
        ),
      ).toThrow("Estimated fee is too high");

      // Lower bound is 20000 / 2 = 10000 sats
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          highFeeRate,
          expectedHighFee / 2,
        ),
      ).not.toThrow();
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          highFeeRate,
          expectedHighFee / 2 - 1,
        ),
      ).toThrow("Estimated fee is too low");

      // Test with a low fee rate
      const lowFeeRate = 1; // 1 sat/vB
      const expectedLowFee = 200; // mockTransaction.virtualSize() * lowFeeRate = 200 * 1 = 200 sats

      // Upper bound is 200 * 2 = 400 sats
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          lowFeeRate,
          expectedLowFee * 2,
        ),
      ).not.toThrow();
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          lowFeeRate,
          expectedLowFee * 2 + 1,
        ),
      ).toThrow("Estimated fee is too high");

      // Lower bound is 200 / 2 = 100 sats
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          lowFeeRate,
          expectedLowFee / 2,
        ),
      ).not.toThrow();
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          lowFeeRate,
          expectedLowFee / 2 - 1,
        ),
      ).toThrow("Estimated fee is too low");
    });
  });

  describe("with varying transaction sizes", () => {
    const feeRate = 5; // 5 sat/vB

    it("should correctly calculate fee boundaries for different transaction sizes", () => {
      // Test with a small transaction
      mockTransaction.virtualSize.mockReturnValue(100);
      const expectedSmallTxFee = 500; // 100 * 5 = 500 sats

      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          feeRate,
          expectedSmallTxFee * 2,
        ),
      ).not.toThrow();
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          feeRate,
          expectedSmallTxFee * 2 + 1,
        ),
      ).toThrow("Estimated fee is too high");
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          feeRate,
          expectedSmallTxFee / 2,
        ),
      ).not.toThrow();
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          feeRate,
          expectedSmallTxFee / 2 - 1,
        ),
      ).toThrow("Estimated fee is too low");

      // Test with a large transaction
      mockTransaction.virtualSize.mockReturnValue(1000);
      const expectedLargeTxFee = 5000; // 1000 * 5 = 5000 sats

      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          feeRate,
          expectedLargeTxFee * 2,
        ),
      ).not.toThrow();
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          feeRate,
          expectedLargeTxFee * 2 + 1,
        ),
      ).toThrow("Estimated fee is too high");
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          feeRate,
          expectedLargeTxFee / 2,
        ),
      ).not.toThrow();
      expect(() =>
        txFeeSafetyCheck(
          mockTransaction as any,
          feeRate,
          expectedLargeTxFee / 2 - 1,
        ),
      ).toThrow("Estimated fee is too low");
    });
  });

  describe("edge cases", () => {
    it("should handle zero fee rate", () => {
      const zeroFeeRate = 0;
      // When fee rate is 0, expected fee is 0, so bounds are also 0
      // This means any estimated fee above 0 would be "too high"
      expect(() =>
        txFeeSafetyCheck(mockTransaction as any, zeroFeeRate, 0),
      ).not.toThrow();
      expect(() =>
        txFeeSafetyCheck(mockTransaction as any, zeroFeeRate, 1),
      ).toThrow("Estimated fee is too high");
    });

    it("should handle zero estimated fee", () => {
      const normalFeeRate = 10;
      // When estimated fee is 0, it should be "too low" if expected fee is > 0
      expect(() =>
        txFeeSafetyCheck(mockTransaction as any, normalFeeRate, 0),
      ).toThrow("Estimated fee is too low");
    });

    it("should handle zero virtual size transaction", () => {
      mockTransaction.virtualSize.mockReturnValue(0);
      const normalFeeRate = 10;

      // With virtual size 0, expected fee is 0
      // So any estimated fee > 0 would be "too high"
      expect(() =>
        txFeeSafetyCheck(mockTransaction as any, normalFeeRate, 0),
      ).not.toThrow();
      expect(() =>
        txFeeSafetyCheck(mockTransaction as any, normalFeeRate, 1),
      ).toThrow("Estimated fee is too high");
    });
  });
});

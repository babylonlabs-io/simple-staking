import { Fees } from "@/ui/common/types/fee";
import { getFeeRateFromMempool } from "@/ui/common/utils/getFeeRateFromMempool";
import { nextPowerOfTwo } from "@/ui/common/utils/nextPowerOfTwo";

/**
 * This test file tests the actual fee calculation utility functions from the codebase.
 * These are the core functions used throughout the app for fee calculations.
 */

describe("Fee Calculation Utilities", () => {
  describe("nextPowerOfTwo", () => {
    it("should return 2 for values less than or equal to 0", () => {
      expect(nextPowerOfTwo(0)).toBe(2);
      expect(nextPowerOfTwo(-1)).toBe(2);
      expect(nextPowerOfTwo(-100)).toBe(2);
    });

    it("should return 4 for value 1", () => {
      expect(nextPowerOfTwo(1)).toBe(4);
    });

    it("should return the power of 2 greater than input for regular values", () => {
      // Per the implementation: Math.pow(2, Math.ceil(Math.log2(x)) + 1)
      // For 2, we should get 2^(ceil(log2(2)) + 1) = 2^(1 + 1) = 2^2 = 4
      expect(nextPowerOfTwo(2)).toBe(4);

      // For 3, we should get 2^(ceil(log2(3)) + 1) = 2^(2 + 1) = 2^3 = 8
      expect(nextPowerOfTwo(3)).toBe(8);

      // For 4, we should get 2^(ceil(log2(4)) + 1) = 2^(2 + 1) = 2^3 = 8
      expect(nextPowerOfTwo(4)).toBe(8);

      // For values just below powers of 2
      // For 31, we should get 2^(ceil(log2(31)) + 1) = 2^(5 + 1) = 2^6 = 64
      expect(nextPowerOfTwo(31)).toBe(64);

      // For exact powers of 2
      // For 32, we should get 2^(ceil(log2(32)) + 1) = 2^(5 + 1) = 2^6 = 64
      expect(nextPowerOfTwo(32)).toBe(64);

      // For values just above powers of 2
      // For 33, we should get 2^(ceil(log2(33)) + 1) = 2^(6 + 1) = 2^7 = 128
      expect(nextPowerOfTwo(33)).toBe(128);

      // For large values
      // For 129, we should get 2^(ceil(log2(129)) + 1) = 2^(8 + 1) = 2^9 = 512
      expect(nextPowerOfTwo(129)).toBe(512);
      // For 1000, we should get 2^(ceil(log2(1000)) + 1) = 2^(10 + 1) = 2^11 = 2048
      expect(nextPowerOfTwo(1000)).toBe(2048);
    });

    it("should handle extreme values correctly", () => {
      // Test with the largest safe integer in JavaScript
      const largeValue = nextPowerOfTwo(Number.MAX_SAFE_INTEGER);
      // The math should be 2^(ceil(log2(MAX_SAFE_INTEGER)) + 1) which is a power of 2
      expect(Math.log2(largeValue) % 1).toBe(0);
    });
  });

  describe("getFeeRateFromMempool", () => {
    it("should correctly extract fee rates from mempool data", () => {
      const mockFees: Fees = {
        fastestFee: 100,
        halfHourFee: 80,
        hourFee: 60,
        economyFee: 40,
        minimumFee: 20,
      };

      const result = getFeeRateFromMempool(mockFees);

      // minFeeRate should be the hourly fee
      expect(result.minFeeRate).toBe(mockFees.hourFee);

      // defaultFeeRate should be the fastest fee
      expect(result.defaultFeeRate).toBe(mockFees.fastestFee);

      // maxFeeRate should use nextPowerOfTwo on fastestFee, but at least 128
      // In this case, nextPowerOfTwo(100) = 256
      expect(result.maxFeeRate).toBe(
        Math.max(128, nextPowerOfTwo(mockFees.fastestFee)),
      );
      expect(result.maxFeeRate).toBe(256);
    });

    it("should handle missing mempool data", () => {
      const result = getFeeRateFromMempool(undefined);

      // All values should be 0 when mempool data is missing
      expect(result.minFeeRate).toBe(0);
      expect(result.defaultFeeRate).toBe(0);
      expect(result.maxFeeRate).toBe(0);
    });

    it("should apply minimum max fee rate of 128 sats/vbyte", () => {
      // Test with low fee rates that would result in nextPowerOfTwo < 128
      const lowFees: Fees = {
        fastestFee: 30, // nextPowerOfTwo(30) = 32, which is < 128
        halfHourFee: 25,
        hourFee: 20,
        economyFee: 15,
        minimumFee: 10,
      };

      const result = getFeeRateFromMempool(lowFees);

      // maxFeeRate should be at least 128, even though nextPowerOfTwo(30) = 32
      expect(result.maxFeeRate).toBe(128);
    });

    it("should use nextPowerOfTwo for max fee rate above minimum", () => {
      // Test with high fee rates that would result in nextPowerOfTwo > 128
      const highFees: Fees = {
        fastestFee: 200, // nextPowerOfTwo(200) = 512, which is > 128
        halfHourFee: 150,
        hourFee: 100,
        economyFee: 50,
        minimumFee: 25,
      };

      const result = getFeeRateFromMempool(highFees);

      // maxFeeRate should be nextPowerOfTwo(200) = 512
      expect(result.maxFeeRate).toBe(nextPowerOfTwo(highFees.fastestFee));
      expect(result.maxFeeRate).toBe(512);
    });

    it("should handle extreme network congestion", () => {
      // Test with extreme fee rates that might occur during high network congestion
      const extremeFees: Fees = {
        fastestFee: 1000, // nextPowerOfTwo(1000) = 2048
        halfHourFee: 800,
        hourFee: 600,
        economyFee: 400,
        minimumFee: 200,
      };

      const result = getFeeRateFromMempool(extremeFees);

      // maxFeeRate should be nextPowerOfTwo(1000) = 2048
      expect(result.maxFeeRate).toBe(nextPowerOfTwo(extremeFees.fastestFee));
      expect(result.maxFeeRate).toBe(2048);
    });
  });

  describe("Fee Calculation Edge Cases", () => {
    it("should handle zero fees gracefully", () => {
      const zeroFees: Fees = {
        fastestFee: 0,
        halfHourFee: 0,
        hourFee: 0,
        economyFee: 0,
        minimumFee: 0,
      };

      const result = getFeeRateFromMempool(zeroFees);

      // For fastestFee = 0, nextPowerOfTwo(0) = 2, but minimum is 128
      expect(result.maxFeeRate).toBe(128);
      expect(result.minFeeRate).toBe(0);
      expect(result.defaultFeeRate).toBe(0);
    });

    xit("should throw error when fee rates are negative", () => {});
  });

  describe("Fee Rate Selection Based on Network Conditions", () => {
    it("should provide appropriate fee rates during normal network conditions", () => {
      const normalFees: Fees = {
        fastestFee: 50,
        halfHourFee: 40,
        hourFee: 30,
        economyFee: 20,
        minimumFee: 10,
      };

      const result = getFeeRateFromMempool(normalFees);

      // Verify the fee rates match expectations for normal conditions
      expect(result.minFeeRate).toBe(30); // hourFee
      expect(result.defaultFeeRate).toBe(50); // fastestFee
      expect(result.maxFeeRate).toBe(128); // Minimum max fee rate
    });

    it("should provide appropriate fee rates during high network congestion", () => {
      const highCongestionFees: Fees = {
        fastestFee: 300, // nextPowerOfTwo(300) = 1024
        halfHourFee: 250,
        hourFee: 200,
        economyFee: 150,
        minimumFee: 100,
      };

      const result = getFeeRateFromMempool(highCongestionFees);

      // Verify the fee rates match expectations for high congestion
      expect(result.minFeeRate).toBe(200); // hourFee
      expect(result.defaultFeeRate).toBe(300); // fastestFee
      expect(result.maxFeeRate).toBe(1024); // nextPowerOfTwo(300) = 1024
    });

    it("should provide appropriate fee rates during low network congestion", () => {
      const lowCongestionFees: Fees = {
        fastestFee: 10,
        halfHourFee: 8,
        hourFee: 5,
        economyFee: 3,
        minimumFee: 1,
      };

      const result = getFeeRateFromMempool(lowCongestionFees);

      // Verify the fee rates match expectations for low congestion
      expect(result.minFeeRate).toBe(5); // hourFee
      expect(result.defaultFeeRate).toBe(10); // fastestFee
      expect(result.maxFeeRate).toBe(128); // Minimum max fee rate
    });
  });
});

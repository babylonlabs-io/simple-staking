import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { Fees } from "@/utils/wallet/wallet_provider";

describe("getFeeRateFromMempool", () => {
  const mempoolFeeRates: Fees = {
    hourFee: 10,
    fastestFee: 100,
    halfHourFee: 50,
    economyFee: 5,
    minimumFee: 1,
  };

  it("should return 0 for min, default, and max fee rates when mempoolFeeRates is undefined", () => {
    const result = getFeeRateFromMempool();
    expect(result).toEqual({
      minFeeRate: 0,
      defaultFeeRate: 0,
      maxFeeRate: 0,
    });
  });

  it("should return the correct min, default, and max fee rates from mempoolFeeRates", () => {
    const result = getFeeRateFromMempool(mempoolFeeRates);
    expect(result).toEqual({
      minFeeRate: mempoolFeeRates.hourFee,
      defaultFeeRate: mempoolFeeRates.fastestFee,
      maxFeeRate: 256, // Ensures that the max fee rate is the next power of two
    });
  });

  it("should return max fee rate of at least 128 sat/vB", () => {
    const feeRate: Fees = {
      ...mempoolFeeRates,
      fastestFee: 5,
    };

    const result = getFeeRateFromMempool(feeRate);
    expect(result).toEqual({
      minFeeRate: feeRate.hourFee,
      defaultFeeRate: feeRate.fastestFee,
      maxFeeRate: 128, // Ensures that the max fee rate is at least 128
    });
  });
});

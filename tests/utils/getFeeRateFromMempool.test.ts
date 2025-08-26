import { Fees } from "@/ui/common/types/fee";
import { getFeeRateFromMempool } from "@/ui/common/utils/getFeeRateFromMempool";
import { nextPowerOfTwo } from "@/ui/common/utils/nextPowerOfTwo";

// Mock nextPowerOfTwo
jest.mock("@/ui/common/utils/nextPowerOfTwo", () => ({
  nextPowerOfTwo: jest.fn(),
}));

describe("getFeeRateFromMempool", () => {
  const mockFees: Fees = {
    fastestFee: 50,
    halfHourFee: 30,
    hourFee: 20,
    economyFee: 10,
    minimumFee: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set a default return value for nextPowerOfTwo that matches the actual implementation
    // For mockFees.fastestFee = 50, nextPowerOfTwo would normally return 128
    (nextPowerOfTwo as jest.Mock).mockReturnValue(128);
  });

  it("should return the correct fee rates when mempool data is provided", () => {
    const result = getFeeRateFromMempool(mockFees);

    // minFeeRate should be the hourly fee
    expect(result.minFeeRate).toBe(mockFees.hourFee);

    // defaultFeeRate should be the fastest fee
    expect(result.defaultFeeRate).toBe(mockFees.fastestFee);

    // maxFeeRate should be the result of nextPowerOfTwo(fastestFee)
    // Verify that nextPowerOfTwo was called with the correct parameter
    expect(nextPowerOfTwo).toHaveBeenCalledWith(mockFees.fastestFee);
    expect(result.maxFeeRate).toBe(128); // Using our mocked return value
  });

  it("should enforce a minimum max fee rate of 128", () => {
    // For a low fastestFee, we want to simulate nextPowerOfTwo returning a value less than 128
    (nextPowerOfTwo as jest.Mock).mockReturnValue(64);

    const lowFees: Fees = {
      fastestFee: 10,
      halfHourFee: 8,
      hourFee: 5,
      economyFee: 3,
      minimumFee: 1,
    };

    const result = getFeeRateFromMempool(lowFees);

    // maxFeeRate should be the higher of LEAST_MAX_FEE_RATE (128) or nextPowerOfTwo(fastestFee)
    expect(nextPowerOfTwo).toHaveBeenCalledWith(lowFees.fastestFee);
    expect(result.maxFeeRate).toBe(128);
  });

  it("should return zero values when mempool data is undefined", () => {
    const result = getFeeRateFromMempool(undefined);

    expect(result.minFeeRate).toBe(0);
    expect(result.defaultFeeRate).toBe(0);
    expect(result.maxFeeRate).toBe(0);

    // nextPowerOfTwo should not be called when mempool data is undefined
    expect(nextPowerOfTwo).not.toHaveBeenCalled();
  });

  it("should handle large fee rates correctly", () => {
    // Simulate nextPowerOfTwo returning a value greater than 128
    (nextPowerOfTwo as jest.Mock).mockReturnValue(512);

    const highFees: Fees = {
      fastestFee: 200,
      halfHourFee: 150,
      hourFee: 100,
      economyFee: 50,
      minimumFee: 20,
    };

    const result = getFeeRateFromMempool(highFees);

    expect(nextPowerOfTwo).toHaveBeenCalledWith(highFees.fastestFee);
    expect(result.maxFeeRate).toBe(512); // The mocked return value, which is > 128
  });
});

import { nextPowerOfTwo } from "./nextPowerOfTwo";
import { Fees } from "./wallet/wallet_provider";

// Returns min, default and max fee rate from mempool
export const getFeeRateFromMempool = (mempoolFeeRates?: Fees) => {
  if (mempoolFeeRates) {
    // The maximum fee rate is at least 128 sat/vB
    const LEAST_MAX_FEE_RATE = 128;
    return {
      minFeeRate: mempoolFeeRates.hourFee,
      defaultFeeRate: mempoolFeeRates.fastestFee,
      maxFeeRate: Math.max(
        LEAST_MAX_FEE_RATE,
        nextPowerOfTwo(mempoolFeeRates.fastestFee),
      ),
    };
  } else {
    return {
      minFeeRate: 0,
      defaultFeeRate: 0,
      maxFeeRate: 0,
    };
  }
};

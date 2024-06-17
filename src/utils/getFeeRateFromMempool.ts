import { nextPowerOfTwo } from "./nextPowerOfTwo";
import { Fees } from "./wallet/wallet_provider";

// Returns min, default and max fee rate from mempool
export const getFeeRateFromMempool = (mempoolFeeRates?: Fees) => {
  if (mempoolFeeRates) {
    return {
      minFeeRate: mempoolFeeRates.hourFee,
      defaultFeeRate: mempoolFeeRates.fastestFee,
      maxFeeRate: nextPowerOfTwo(mempoolFeeRates?.fastestFee! * 2),
    };
  } else {
    return {
      minFeeRate: 0,
      defaultFeeRate: 0,
      maxFeeRate: 0,
    };
  }
};

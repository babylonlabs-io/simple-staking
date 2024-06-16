import { nextPowerOfTwo } from "./nextPowerOfTwo";
import { Fees } from "./wallet/wallet_provider";

// Returns min, default and max fee rate from mempool
export const getFeeRateFromMempool = (mempoolFeeRates: Fees) => {
  return {
    minFeeRate: mempoolFeeRates.hourFee,
    defaultFeeRate: mempoolFeeRates.fastestFee,
    maxFeeRate: nextPowerOfTwo(mempoolFeeRates?.fastestFee! * 2),
  };
};

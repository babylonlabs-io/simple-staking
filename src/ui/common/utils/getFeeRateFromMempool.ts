import { Fees } from "@/ui/common/types/fee";

import { nextPowerOfTwo } from "./nextPowerOfTwo";

const LEAST_MAX_FEE_RATE = 128;

// Returns min, default and max fee rate from mempool
export const getFeeRateFromMempool = (mempoolFeeRates?: Fees) =>
  mempoolFeeRates
    ? {
        minFeeRate: mempoolFeeRates.hourFee,
        defaultFeeRate: mempoolFeeRates.fastestFee,
        maxFeeRate: Math.max(
          LEAST_MAX_FEE_RATE,
          nextPowerOfTwo(mempoolFeeRates.fastestFee),
        ),
      }
    : {
        minFeeRate: 0,
        defaultFeeRate: 0,
        maxFeeRate: 0,
      };

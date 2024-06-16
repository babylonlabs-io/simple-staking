import { useEffect, useState } from "react";

import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { nextPowerOfTwo } from "@/utils/nextPowerOfTwo";
import { Fees } from "@/utils/wallet/wallet_provider";

import { LoadingSmall } from "../../Loading/Loading";

interface StakingFeeProps {
  stakingFeeSat: number;
  customFeeRate: number;
  onCustomFeeRateChange: (fee: number) => void;
  reset: boolean;
  // optional as component shows loading state
  mempoolFeeRates?: Fees;
}

// Staking fee sat might be expensive to calculate as it sums UTXOs
export const StakingFee: React.FC<StakingFeeProps> = ({
  stakingFeeSat,
  customFeeRate,
  onCustomFeeRateChange,
  reset,
  mempoolFeeRates,
}) => {
  const [customMode, setCustomMode] = useState(false);

  // Use effect to reset the state when reset prop changes
  useEffect(() => {
    setCustomMode(false);
  }, [reset]);

  const { coinName } = getNetworkConfig();

  const defaultModeRender = () => {
    return (
      <div className="flex flex-col justify-center gap-1 items-center">
        <div className="min-h-8 flex justify-center flex-col items-center">
          {mempoolFeeRates ? (
            <p>
              Recommended fee rate:{" "}
              <strong>{mempoolFeeRates.fastestFee} sats/vB</strong>
            </p>
          ) : (
            <LoadingSmall text="Loading recommended fee rate..." />
          )}
          {stakingFeeSat ? (
            <p>
              Transaction fee amount:{" "}
              <strong>
                {satoshiToBtc(stakingFeeSat)} {coinName}
              </strong>
            </p>
          ) : (
            <LoadingSmall text="Loading transaction fee amount..." />
          )}
        </div>
        <button
          className="btn btn-sm btn-link no-underline"
          onClick={() => setCustomMode(true)}
          disabled={!mempoolFeeRates || !stakingFeeSat}
        >
          Use Custom
        </button>
      </div>
    );
  };

  const customModeRender = () => {
    // Slider min should be the economy fee
    // Slider max should be 2x the fastest fee of power of 2
    // 300 -> 1024, 16 -> 32, 24 -> 64
    const maxFeeRate = nextPowerOfTwo(mempoolFeeRates?.fastestFee! * 2);

    // If fee is below the fastest fee, show a warning
    const showWarning =
      customFeeRate &&
      mempoolFeeRates &&
      customFeeRate < mempoolFeeRates?.fastestFee;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-center">
          <p>
            Custom fee rate:{" "}
            <strong>
              {customFeeRate || mempoolFeeRates?.fastestFee} sat/vB
            </strong>
          </p>
          <p>
            Transaction fee amount:{" "}
            <strong>
              {satoshiToBtc(stakingFeeSat)} {coinName}
            </strong>
          </p>
        </div>
        <div>
          <input
            type="range"
            min={mempoolFeeRates?.hourFee}
            max={maxFeeRate}
            value={customFeeRate || mempoolFeeRates?.fastestFee}
            className={`range range-xs my-2 opacity-60 ${showWarning ? "range-error" : "range-primary"}`}
            onChange={(e) => {
              onCustomFeeRateChange(parseInt(e.target.value));
            }}
          />
          <div className="w-full flex justify-between text-xs px-0 items-center">
            <span className="opacity-50">
              {mempoolFeeRates?.hourFee} sat/vB
            </span>
            {showWarning ? (
              <p className="text-center text-error">Fees are low</p>
            ) : null}
            <span className="opacity-50">{maxFeeRate} sat/vB</span>
          </div>
        </div>
      </div>
    );
  };

  // fetched fee rates and staking fee sat
  const customModeReady = customMode && mempoolFeeRates && stakingFeeSat;

  return (
    <div className="my-2 text-sm">
      {customModeReady ? customModeRender() : defaultModeRender()}
    </div>
  );
};

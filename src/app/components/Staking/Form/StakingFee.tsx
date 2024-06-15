import { useEffect, useState } from "react";

import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { nextPowerOfTwo } from "@/utils/nextPowerOfTwo";
import { Fees } from "@/utils/wallet/wallet_provider";

import { LoadingSmall } from "../../Loading/Loading";

interface StakingFeeProps {
  feeRates?: Fees;
  stakingFeeSat?: number;
  customFeeRate: number;
  onCustomFeeRateChange: (fee: number) => void;
  reset: boolean;
}

// Staking fee sat might be expensive to calculate as it sums UTXOs
export const StakingFee: React.FC<StakingFeeProps> = ({
  feeRates,
  stakingFeeSat,
  customFeeRate,
  onCustomFeeRateChange,
  reset,
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
          {feeRates ? (
            <p>Recommended fee rate: {feeRates.fastestFee} sats/vB</p>
          ) : (
            <LoadingSmall text="Loading recommended fee rate..." />
          )}
          {stakingFeeSat ? (
            <p>
              Transaction fee amount: {satoshiToBtc(stakingFeeSat)} {coinName}
            </p>
          ) : (
            <LoadingSmall text="Loading transaction fee amount..." />
          )}
        </div>
        <button
          className="btn btn-sm btn-link no-underline"
          onClick={() => setCustomMode(true)}
          disabled={!feeRates || !stakingFeeSat}
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
    const maxFeeRate = nextPowerOfTwo(feeRates?.fastestFee! * 2);

    // If fee is below the fastest fee, show a warning
    const showWarning =
      customFeeRate && feeRates && customFeeRate < feeRates?.fastestFee;

    return (
      <div className="flex flex-col gap-2">
        <label className="form-control flex-1">
          <div className={`label`}>
            <span className="label-text-alt text-base text-md">Fee</span>
            <span className="label-text-alt opacity-50">
              Fee rate: {customFeeRate || feeRates?.fastestFee} sat/vB
            </span>
          </div>
          <label className="input input-bordered flex items-center gap-2 no-focus">
            <input
              type="text"
              className="no-focus grow"
              value={stakingFeeSat ? satoshiToBtc(stakingFeeSat) : ""}
              readOnly
            />
            <p>{coinName}</p>
          </label>
        </label>
        <div>
          <input
            type="range"
            min={feeRates?.economyFee}
            max={maxFeeRate}
            value={customFeeRate || feeRates?.fastestFee}
            className={`range range-xs my-2 opacity-60 ${showWarning ? "range-error" : "range-primary"}`}
            onChange={(e) => {
              onCustomFeeRateChange(parseInt(e.target.value));
            }}
          />
          <div className="w-full flex justify-between text-xs px-0 items-center">
            <span className="opacity-50">{feeRates?.economyFee} sat/vB</span>
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
  const customModeReady = customMode;

  return (
    <div className="my-2 text-sm">
      {customModeReady ? customModeRender() : defaultModeRender()}
    </div>
  );
};

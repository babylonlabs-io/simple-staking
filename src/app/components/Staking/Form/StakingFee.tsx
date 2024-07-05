import { useEffect, useState } from "react";

import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { Fees } from "@/utils/wallet/wallet_provider";

import { LoadingSmall } from "../../Loading/Loading";

interface StakingFeeProps {
  stakingFeeSat: number;
  selectedFeeRate: number;
  onSelectedFeeRateChange: (fee: number) => void;
  reset: boolean;
  // optional as component shows loading state
  mempoolFeeRates?: Fees;
}

// Staking fee sat might be expensive to calculate as it sums UTXOs
export const StakingFee: React.FC<StakingFeeProps> = ({
  stakingFeeSat,
  selectedFeeRate,
  onSelectedFeeRateChange,
  reset,
  mempoolFeeRates,
}) => {
  const [customMode, setCustomMode] = useState(false);

  // Use effect to reset the state when reset prop changes
  useEffect(() => {
    setCustomMode(false);
  }, [reset]);

  const { coinName } = getNetworkConfig();

  const { minFeeRate, defaultFeeRate, maxFeeRate } =
    getFeeRateFromMempool(mempoolFeeRates);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);

    if (mempoolFeeRates && value >= 0) {
      if (value >= minFeeRate && value <= maxFeeRate) {
        onSelectedFeeRateChange(parseInt(e.target.value));
      }
    }
  };

  const defaultModeRender = () => {
    return (
      <div className="flex flex-col justify-center gap-1 items-center">
        <div className="min-h-8 flex justify-center flex-col items-center">
          {mempoolFeeRates ? (
            <p>
              Recommended fee rate: <strong>{defaultFeeRate} sats/vB</strong>
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
          className="btn btn-sm btn-link no-underline text-es-accent"
          onClick={() => setCustomMode(true)}
          disabled={!mempoolFeeRates || !stakingFeeSat}
        >
          Use Custom
        </button>
      </div>
    );
  };

  const selectedModeRender = () => {
    // If fee is below the fastest fee, show a warning
    const showLowFeesWarning =
      selectedFeeRate && mempoolFeeRates && selectedFeeRate < defaultFeeRate;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-center">
          <p>
            Selected fee rate:{" "}
            <strong>{selectedFeeRate || defaultFeeRate} sat/vB</strong>
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
            min={minFeeRate}
            max={maxFeeRate}
            value={selectedFeeRate || defaultFeeRate}
            className={`range range-xs my-2 opacity-60 ${showLowFeesWarning ? "range-error" : "range-primary"}`}
            onChange={handleSliderChange}
          />
          <div className="w-full flex justify-between text-xs px-0 items-center">
            <span className="opacity-50">{minFeeRate} sat/vB</span>
            {showLowFeesWarning ? (
              <p className="text-center text-error">
                Fees are low, inclusion is not guaranteed
              </p>
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
    <div className="my-2 text-sm w-full">
      {customModeReady ? selectedModeRender() : defaultModeRender()}
    </div>
  );
};

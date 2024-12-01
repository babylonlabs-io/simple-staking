import { Button, Text } from "@babylonlabs-io/bbn-core-ui";
import { useEffect, useState } from "react";
import { FaPen } from "react-icons/fa6";

import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btc";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { Fees } from "@/utils/wallet/btc_wallet_provider";

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
      <div className="flex flex-col gap-6">
        {mempoolFeeRates ? (
          <>
            <div className="flex flex-row items-center justify-between text-primary-dark">
              <Text variant="body1">Network Fee Rate</Text>
              <div className="flex flex-row gap-2 items-center">
                <Text variant="body1">25 Sats/vB</Text>
                <Button
                  size="small"
                  variant="outlined"
                  className="pl-1 w-6 h-6"
                >
                  <FaPen size={16} />
                </Button>
              </div>
            </div>
            <div className="flex flex-row items-start justify-between text-primary-dark">
              <Text variant="body1">Bitcoin Network Fee</Text>
              <div className="flex flex-col items-end justify-center">
                <Text variant="body1">0.00000025</Text>
                <Text variant="body1" className="text-primary-light text-sm">
                  $0.02
                </Text>
              </div>
            </div>
            <div className="flex flex-row items-start justify-between text-primary-dark">
              <Text variant="body1">Babylon Network Fee</Text>
              <div className="flex flex-col items-end justify-center">
                <Text variant="body1">2.0000</Text>
                <Text variant="body1" className="text-primary-light text-sm">
                  $0.02
                </Text>
              </div>
            </div>
            <div className="divider mx-0 my-0" />
            <div className="flex flex-row items-start justify-between text-primary-dark">
              <Text variant="body1" className="font-bold">
                Total
              </Text>
              <div className="flex flex-col items-end justify-center">
                <Text variant="body1" className="font-bold">
                  0.004
                </Text>
                <Text variant="body1" className="text-primary-light text-sm">
                  $370.03
                </Text>
              </div>
            </div>
          </>
        ) : (
          <LoadingSmall text="Loading recommended fee rate..." />
        )}
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
    <div className="my-2 text-sm">
      {customModeReady ? selectedModeRender() : defaultModeRender()}
    </div>
  );
};

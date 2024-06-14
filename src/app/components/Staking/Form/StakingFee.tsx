import { useQuery } from "@tanstack/react-query";
import { networks } from "bitcoinjs-lib";
import { useEffect, useState } from "react";

import { FinalityProvider } from "@/app/types/finalityProviders";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { createStakingTx } from "@/utils/delegations/signStakingTx";
import { WalletProvider } from "@/utils/wallet/wallet_provider";

import { LoadingSmall } from "../../Loading/Loading";

interface StakingFeeProps {
  btcWallet: WalletProvider;
  address: string;
  btcWalletNetwork: networks.Network;
  finalityProvider: FinalityProvider;
  globalParamsVersion: GlobalParamsVersion;
  stakingTimeBlocks: number;
  stakingAmountSat: number;
  publicKeyNoCoord: string;
  customFeeRate: number;
  onCustomFeeRateChange: (fee: number) => void;
  reset: boolean;
}

// Staking fee sat might be expensive to calculate as it sums UTXOs
export const StakingFee: React.FC<StakingFeeProps> = ({
  btcWallet,
  address,
  btcWalletNetwork,
  finalityProvider,
  globalParamsVersion,
  stakingTimeBlocks,
  stakingAmountSat,
  publicKeyNoCoord,
  customFeeRate,
  onCustomFeeRateChange,
  reset,
}) => {
  const [customMode, setCustomMode] = useState(false);
  const [customFeeButtonSelected, setCustomFeeButtonSelected] =
    useState<number>();

  // Use effect to reset the state when reset prop changes
  useEffect(() => {
    setCustomMode(false);
    setCustomFeeButtonSelected(undefined);
  }, [reset]);

  // Fetch fee rates, sat/vB
  const { data: feeRates } = useQuery({
    queryKey: ["fee rates"],
    queryFn: btcWallet.getNetworkFees,
    refetchInterval: 60000, // 1 minute
  });

  // Fetch all UTXOs
  const { data: UTXOs } = useQuery({
    queryKey: ["UTXOs", address],
    // Has a second optional parameter, the amount of satoshis to spend
    // Can be used for optimization
    queryFn: () => btcWallet.getUtxos(address),
    refetchInterval: 60000 * 5, // 5 minutes
  });

  // Fetch staking fee, sat
  const { data: stakingFeeSat } = useQuery({
    queryKey: ["staking fee sat", address, customFeeRate],
    queryFn: () =>
      // This function is always run in sync mode as no fetch is needed
      // So there are gitter in the UI
      createStakingTx(
        btcWallet,
        address,
        btcWalletNetwork,
        finalityProvider,
        globalParamsVersion,
        stakingTimeBlocks,
        stakingAmountSat,
        publicKeyNoCoord,
        // Same as above, if feeRates is not fetched, the query won't be triggered
        customFeeRate || feeRates?.fastestFee!,
        // Without UTXOs, the fetch query won't be triggered
        UTXOs!,
      ),
    // Only enabled if there are UTXOs and fee rates
    enabled: !!(UTXOs && UTXOs?.length > 0 && feeRates?.fastestFee),
    select: (data) => data.stakingFeeSat,
    refetchInterval: 60000 * 5, // 5 minutes
  });

  const { coinName } = getNetworkConfig();

  const defaultModeRender = () => {
    return (
      <div className="flex flex-col justify-center gap-1 items-center">
        <div className="min-h-8 flex justify-center flex-col items-center">
          {feeRates ? (
            <p>Recommended fee size: {feeRates.fastestFee} sats/vB</p>
          ) : (
            <LoadingSmall text="Loading recommended fee size..." />
          )}
          {stakingFeeSat ? (
            <p>
              Total fee amount: {satoshiToBtc(stakingFeeSat)} {coinName}
            </p>
          ) : (
            <LoadingSmall text="Loading total fee amount..." />
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
    const generateButtonClasses = (index: number) => {
      return `btn btn-xs btn-outline h-8 flex-1 ${
        customFeeButtonSelected === index ? "btn-primary" : ""
      }`;
    };

    const ULTRA_HIGH_MULTIPLIER = 2;
    const ULTRA_HIGH_FEE_RATE = feeRates!.fastestFee * ULTRA_HIGH_MULTIPLIER;

    const buttons = [
      {
        label: "low",
        fee: feeRates!.hourFee,
      },
      {
        label: "medium",
        fee: feeRates!.halfHourFee,
      },
      {
        label: "high",
        fee: feeRates!.fastestFee,
      },
      {
        label: "ultra high",
        fee: ULTRA_HIGH_FEE_RATE,
      },
    ];

    return (
      <div className="flex flex-col gap-2">
        <label className="form-control flex-1">
          <div
            className={`label justify-end ${customFeeRate ? "flex" : "invisible"}`}
          >
            <span className="label-text-alt opacity-50">
              Fee rate: {customFeeRate} sat/vB
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
        <div className="flex gap-2">
          <button
            className="btn btn-xs btn-ghost h-8"
            onClick={() => {
              setCustomFeeButtonSelected(undefined);
              if (!customFeeRate) {
                onCustomFeeRateChange(feeRates!.fastestFee);
              } else if (customFeeRate >= feeRates!.minimumFee) {
                onCustomFeeRateChange(customFeeRate - 1);
              }
            }}
            disabled={!customFeeRate || customFeeRate <= feeRates!.minimumFee}
          >
            -
          </button>
          {buttons.map((button, index) => (
            <button
              key={button.label}
              className={generateButtonClasses(index)}
              onClick={() => {
                setCustomFeeButtonSelected(index);
                onCustomFeeRateChange(button.fee);
              }}
            >
              {button.label}
            </button>
          ))}
          <button
            className="btn btn-xs btn-ghost h-8"
            onClick={() => {
              setCustomFeeButtonSelected(undefined);
              if (!customFeeRate) {
                onCustomFeeRateChange(feeRates!.fastestFee);
              } else if (
                customFeeRate <
                feeRates!.fastestFee * ULTRA_HIGH_MULTIPLIER
              ) {
                onCustomFeeRateChange(customFeeRate + 1);
              }
            }}
            disabled={
              !customFeeRate ||
              customFeeRate >= feeRates!.fastestFee * ULTRA_HIGH_MULTIPLIER
            }
          >
            +
          </button>
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

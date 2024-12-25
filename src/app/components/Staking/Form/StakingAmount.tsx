import { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";

import { getNetworkConfigBTC } from "@/config/network/btc";
import { btcToSatoshi, satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";

import { validateDecimalPoints } from "./validation/validation";

interface StakingAmountProps {
  minStakingAmountSat: number;
  maxStakingAmountSat: number;
  btcWalletBalanceSat?: number;
  onStakingAmountSatChange: (inputAmountSat: number) => void;
  reset: boolean;
  disabled?: boolean;
}

export const StakingAmount: React.FC<StakingAmountProps> = ({
  minStakingAmountSat,
  maxStakingAmountSat,
  btcWalletBalanceSat,
  onStakingAmountSatChange,
  reset,
  disabled = false,
}) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  // Track if the input field has been interacted with
  const [touched, setTouched] = useState(false);

  const errorLabel = "Staking amount";
  const generalErrorMessage = "You should input staking amount";

  const { coinName } = getNetworkConfigBTC();

  // Use effect to reset the state when reset prop changes
  useEffect(() => {
    setValue("");
    setError("");
    setTouched(false);
  }, [reset]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow the input to be changed freely
    setValue(newValue);

    if (touched && newValue === "") {
      setError(generalErrorMessage);
    } else {
      setError("");
    }
  };

  useEffect(() => {
    if (btcWalletBalanceSat === undefined || value === "") return;
    const numValue = parseFloat(value);
    const satoshis = btcToSatoshi(numValue);

    // Run all validations
    const validations = [
      {
        valid: !isNaN(Number(value)),
        message: `${errorLabel} must be a valid number.`,
      },
      {
        valid: numValue !== 0,
        message: `${errorLabel} must be greater than 0.`,
      },
      {
        valid: satoshis >= minStakingAmountSat,
        message: `${errorLabel} must be at least ${satoshiToBtc(minStakingAmountSat)} ${coinName}.`,
      },
      {
        valid: satoshis <= maxStakingAmountSat,
        message: `${errorLabel} must be no more than ${satoshiToBtc(maxStakingAmountSat)} ${coinName}.`,
      },
      {
        valid: satoshis <= btcWalletBalanceSat,
        message: `${errorLabel} exceeds your balance (${satoshiToBtc(btcWalletBalanceSat)} ${coinName})!`,
      },
      {
        valid: validateDecimalPoints(value),
        message: `${errorLabel} must have no more than 8 decimal points.`,
      },
    ];

    // Find the first failing validation
    const firstInvalid = validations.find((validation) => !validation.valid);

    if (firstInvalid) {
      onStakingAmountSatChange(0);
      setError(firstInvalid.message);
    } else {
      setError("");
      onStakingAmountSatChange(satoshis);
    }
  }, [
    btcWalletBalanceSat,
    minStakingAmountSat,
    maxStakingAmountSat,
    value,
    onStakingAmountSatChange,
    coinName,
  ]);

  const handleBlur = (_e: FocusEvent<HTMLInputElement>) => {
    if (value === "") {
      onStakingAmountSatChange(0);
      setError(generalErrorMessage);
      return;
    }
    setTouched(true);
  };

  const minStakeAmount = maxDecimals(satoshiToBtc(minStakingAmountSat), 8);
  const maxStakeAmount = maxDecimals(satoshiToBtc(maxStakingAmountSat), 8);
  return (
    <label className="form-control w-full flex-1">
      <div className="label pt-0">
        <span className="label-text-alt text-base">Amount</span>
        <span className="label-text-alt opacity-50">
          min/max: {minStakeAmount}/{maxStakeAmount} {coinName}
        </span>
      </div>
      <input
        type="string"
        className={twJoin(
          `no-focus input input-bordered w-full`,
          error && "input-error",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={coinName}
        disabled={disabled}
      />

      <div className="text-left my-2 min-h-5">
        {error && <p className="text-sm text-error-main">{error}</p>}
      </div>
    </label>
  );
};

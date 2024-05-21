import { ChangeEvent, FocusEvent, useState } from "react";

import { btcToSatoshi, satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";
import { validateDecimalPoints } from "./validation/validation";

interface StakingAmountProps {
  minStakingAmountSat: number;
  maxStakingAmountSat: number;
  btcWalletBalanceSat: number;
  onStakingAmountSatChange: (inputAmountSat: number) => void;
}

export const StakingAmount: React.FC<StakingAmountProps> = ({
  minStakingAmountSat,
  maxStakingAmountSat,
  btcWalletBalanceSat,
  onStakingAmountSatChange,
}) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  // Track if the input field has been interacted with
  const [touched, setTouched] = useState(false);

  const errorLabel = "Staking amount";
  const generalErrorMessage = "You should input staking amount";

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

  const handleBlur = (_e: FocusEvent<HTMLInputElement>) => {
    setTouched(true);

    if (value === "") {
      onStakingAmountSatChange(0);
      setError(generalErrorMessage);
      return;
    }

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
        message: `${errorLabel} must be at least ${satoshiToBtc(minStakingAmountSat)} Signet BTC.`,
      },
      {
        valid: satoshis <= maxStakingAmountSat,
        message: `${errorLabel} must be no more than ${satoshiToBtc(maxStakingAmountSat)} Signet BTC.`,
      },
      {
        valid: satoshis <= btcWalletBalanceSat,
        message: `${errorLabel} must be no more than ${satoshiToBtc(btcWalletBalanceSat)} wallet balance.`,
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
      setValue(maxDecimals(satoshiToBtc(satoshis), 8).toString());
    }
  };

  return (
    <label className="form-control w-full flex-1">
      <div className="label pt-0">
        <span className="label-text-alt text-base">Amount</span>
        <span className="label-text-alt opacity-50">
          min stake is {maxDecimals(satoshiToBtc(minStakingAmountSat), 8)}{" "}
          Signet BTC
        </span>
      </div>
      <input
        type="string"
        className={`no-focus input input-bordered w-full ${error && "input-error"}`}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Signet BTC"
      />
      <div className="mb-2 mt-4 min-h-[20px]">
        <p className="text text-center text-sm text-error">{error}</p>
      </div>
    </label>
  );
};

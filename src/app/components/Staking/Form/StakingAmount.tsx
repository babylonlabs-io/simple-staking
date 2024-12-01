import { Button, Heading, Text } from "@babylonlabs-io/bbn-core-ui";
import { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import { FaBitcoin } from "react-icons/fa6";
import { twJoin } from "tailwind-merge";

import { getNetworkConfig } from "@/config/network.config";
import { btcToSatoshi, satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";

import { validateDecimalPoints } from "./validation/validation";

interface StakingAmountProps {
  minStakingAmountSat: number;
  maxStakingAmountSat: number;
  btcWalletBalanceSat?: number;
  onStakingAmountSatChange: (inputAmountSat: number) => void;
  reset: boolean;
}

export const StakingAmount: React.FC<StakingAmountProps> = ({
  minStakingAmountSat,
  maxStakingAmountSat,
  btcWalletBalanceSat,
  onStakingAmountSatChange,
  reset,
}) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  // Track if the input field has been interacted with
  const [touched, setTouched] = useState(false);

  const errorLabel = "Staking amount";
  const generalErrorMessage = "You should input staking amount";

  const { coinName } = getNetworkConfig();

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
        <Heading variant="h6" className="text-xl text-primary-dark">
          Amount
        </Heading>
      </div>
      <div className={"flex flex-col gap-6"}>
        <div className="flex flex-col">
          <div
            className={twJoin(
              "flex flex-col gap-2 border rounded border-primary-light p-3",
              error ? "border-error-main" : "",
            )}
          >
            <div className="flex flex-row items-center">
              <input
                type="string"
                className={twJoin(
                  "no-focus w-full bg-transparent",
                  error ? "text-error-main" : "",
                )}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div className="flex flex-row items-center p-1 border rounded-[100px] border-primary-light/20">
                <FaBitcoin size={24} className="text-secondary-main" />
                <Text variant="body1" className="text-sm px-2 py-1">
                  BTC
                </Text>
              </div>
            </div>
            <div className="flex flex-row items-center justify-between text-primary-light">
              <Text variant="body1" className="text-xs">
                $90,000.42
              </Text>
              <div className="flex flex-row items-center gap-2">
                <Text variant="body1" className="text-xs">
                  10.0000 BTC
                </Text>
                <Button
                  size="small"
                  color="secondary"
                  className="bg-primary-contrast text-xs h-5"
                >
                  Max
                </Button>
              </div>
            </div>
          </div>
          {error && (
            <div className="my-2 min-h-[20px]">
              <p className="text-center text-sm text-error-main">{error}</p>
            </div>
          )}
        </div>
      </div>
    </label>
  );
};

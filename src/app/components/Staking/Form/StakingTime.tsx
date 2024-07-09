import { ChangeEvent, FocusEvent, useEffect, useState } from "react";

import { getNetworkConfig } from "@/config/network.config";
import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";

import { validateNoDecimalPoints } from "./validation/validation";

interface StakingTimeProps {
  minStakingTimeBlocks: number;
  maxStakingTimeBlocks: number;
  unbondingTimeBlocks: number;
  onStakingTimeBlocksChange: (inputTimeBlocks: number) => void;
  reset: boolean;
}

export const StakingTime: React.FC<StakingTimeProps> = ({
  minStakingTimeBlocks,
  maxStakingTimeBlocks,
  unbondingTimeBlocks,
  onStakingTimeBlocksChange,
  reset,
}) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  // Track if the input field has been interacted with
  const [touched, setTouched] = useState(false);

  const errorLabel = "Staking term";
  const generalErrorMessage = "You should input staking term";

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

  const handleBlur = (_e: FocusEvent<HTMLInputElement>) => {
    setTouched(true);

    if (value === "") {
      onStakingTimeBlocksChange(0);
      setError(generalErrorMessage);
      return;
    }

    const numValue = Number(value);

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
        valid: validateNoDecimalPoints(value),
        message: `${errorLabel} must not have decimal points.`,
      },
      {
        valid: numValue >= minStakingTimeBlocks,
        message: `${errorLabel} must be at least ${minStakingTimeBlocks} blocks.`,
      },
      {
        valid: numValue <= maxStakingTimeBlocks,
        message: `${errorLabel} must be no more than ${maxStakingTimeBlocks} blocks.`,
      },
    ];

    // Find the first failing validation
    const firstInvalid = validations.find((validation) => !validation.valid);

    if (firstInvalid) {
      onStakingTimeBlocksChange(0);
      setError(firstInvalid.message);
    } else {
      setError("");
      onStakingTimeBlocksChange(numValue);
    }
  };

  const isFixed = minStakingTimeBlocks === maxStakingTimeBlocks;
  if (isFixed) {
    return (
      <div className="card mb-2 bg-base-200 p-4">
        <p>
          You can unbond and withdraw your stake anytime with an unbonding time
          of {blocksToDisplayTime(unbondingTimeBlocks)}.
        </p>
        <p>
          There is also a build-in maximum staking period of{" "}
          {blocksToDisplayTime(minStakingTimeBlocks)}.
        </p>
        <p>
          If the stake is not unbonded before the end of this period, it will
          automatically become withdrawable by you anytime afterwards.
        </p>
        <p>
          The above times are approximates based on average {coinName} block
          time.
        </p>
      </div>
    );
  }

  return (
    <label className="form-control w-full flex-1">
      <div className="label">
        <span className="label-text-alt text-base">Term</span>
        <span className="label-text-alt">
          min term is {minStakingTimeBlocks} blocks
        </span>
      </div>
      <input
        type="string"
        className={`no-focus input input-bordered w-full ${error && "input-error"}`}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Blocks"
      />
      <div className="mb-2 mt-4 min-h-[20px]">
        <p className="text-center text-sm text-error">{error}</p>
      </div>
    </label>
  );
};

import { ChangeEvent, FocusEvent, useState } from "react";

import { blocksToTime } from "@/utils/blocksToTime";
import {
  validateMax,
  validateMin,
  validateNotZero,
  validateNumber,
  validateNoDecimalPoints,
} from "./validation/validation";

interface StakingTimeProps {
  minStakingTimeBlocks: number;
  maxStakingTimeBlocks: number;
  onStakingTimeBlocksChange: (inputTimeBlocks: number) => void;
}

export const StakingTime: React.FC<StakingTimeProps> = ({
  minStakingTimeBlocks,
  maxStakingTimeBlocks,
  onStakingTimeBlocksChange,
}) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  // Track if the input field has been interacted with
  const [touched, setTouched] = useState(false);

  const label = "Staking term";
  const generalErrorMessage = "You should input staking term";

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
      validateNumber(value, label),
      validateNotZero(numValue, label),
      validateNoDecimalPoints(value, label),
      validateMin(numValue, minStakingTimeBlocks, label),
      validateMax(numValue, maxStakingTimeBlocks, label),
    ];

    // Find the first error message
    const errorMessage = validations.find((msg) => msg !== "");

    if (errorMessage) {
      onStakingTimeBlocksChange(0);
      setError(errorMessage);
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
          Your Signet BTC will be staked for a fixed term of{" "}
          {blocksToTime(minStakingTimeBlocks)}.
        </p>
        <p>
          You can unbond and withdraw your Signet BTC anytime through this
          dashboard with an unbond time of 7 days.
        </p>
        <p>
          The above times are approximates based on average Bitcoin block times.
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
        <p className="text text-center text-sm text-error">{error}</p>
      </div>
    </label>
  );
};

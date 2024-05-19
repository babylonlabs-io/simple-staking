import { blocksToTime } from "@/utils/blocksToTime";

interface StakingTimeProps {
  minStakingTimeBlocks: number;
  maxStakingTimeBlocks: number;
  stakingTimeBlocks: number;
  onStakingTimeChange: (inputTimeBlocks: number) => void;
}

export const StakingTime: React.FC<StakingTimeProps> = ({
  minStakingTimeBlocks,
  maxStakingTimeBlocks,
  stakingTimeBlocks,
  onStakingTimeChange,
}) => {
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
          dashboard with an unbond time of 10 days.
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
      </div>
      <input
        type="number"
        placeholder="Blocks"
        className="no-focus input input-bordered w-full"
        min={minStakingTimeBlocks}
        max={maxStakingTimeBlocks}
        value={stakingTimeBlocks}
        onChange={(e) => onStakingTimeChange(Number(e.target.value))}
      />
      <div className="label flex justify-end">
        <span className="label-text-alt">
          min term is {minStakingTimeBlocks} blocks
        </span>
      </div>
    </label>
  );
};

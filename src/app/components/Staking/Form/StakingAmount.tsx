interface StakingAmountProps {
  minStakingAmountBTC: number;
  maxStakingAmountBTC: number;
  stakingAmountBTC: number;
  onStakingAmountChange: (inputAmountBTC: number) => void;
}

export const StakingAmount: React.FC<StakingAmountProps> = ({
  minStakingAmountBTC,
  maxStakingAmountBTC,
  stakingAmountBTC,
  onStakingAmountChange,
}) => {
  return (
    <label className="form-control w-full flex-1">
      <div className="label pt-0">
        <span className="label-text-alt text-base">Amount</span>
      </div>
      <input
        type="number"
        placeholder="BTC"
        className="no-focus input input-bordered w-full"
        min={minStakingAmountBTC}
        max={maxStakingAmountBTC}
        step={0.00001}
        value={stakingAmountBTC}
        onChange={(e) => onStakingAmountChange(Number(e.target.value))}
      />
      <div className="label flex justify-end">
        <span className="label-text-alt">
          min stake is {minStakingAmountBTC} Signet BTC
        </span>
      </div>
    </label>
  );
};

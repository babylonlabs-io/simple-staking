import { btcToSatoshi, satoshiToBtc } from "@/utils/btcConversions";

interface StakingAmountProps {
  minStakingAmountSat: number;
  maxStakingAmountSat: number;
  stakingAmountSat: number;
  onStakingAmountChange: (inputAmountSat: number) => void;
}

export const StakingAmount: React.FC<StakingAmountProps> = ({
  minStakingAmountSat,
  maxStakingAmountSat,
  stakingAmountSat,
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
        min={satoshiToBtc(minStakingAmountSat)}
        max={satoshiToBtc(maxStakingAmountSat)}
        step={0.00001}
        value={satoshiToBtc(stakingAmountSat)}
        onChange={(e) =>
          onStakingAmountChange(btcToSatoshi(Number(e.target.value)))
        }
      />
      <div className="label flex justify-end">
        <span className="label-text-alt">
          min stake is {satoshiToBtc(minStakingAmountSat)} Signet BTC
        </span>
      </div>
    </label>
  );
};

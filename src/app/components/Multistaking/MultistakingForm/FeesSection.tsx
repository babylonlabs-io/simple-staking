import { BBN_FEE_AMOUNT } from "@/app/constants";
import { useStakingState } from "@/app/state/StakingState";
import { BBNFeeAmount } from "@/components/staking/StakingForm/components/BBNFeeAmount";
import { BTCFeeAmount } from "@/components/staking/StakingForm/components/BTCFeeAmount";
import { BTCFeeRate } from "@/components/staking/StakingForm/components/BTCFeeRate";
import { Total } from "@/components/staking/StakingForm/components/Total";

export const FeesSection = () => {
  const { stakingInfo } = useStakingState();

  return (
    <div className="flex flex-col gap-6 p-4">
      <BTCFeeRate defaultRate={stakingInfo?.defaultFeeRate} />
      <BTCFeeAmount />
      {BBN_FEE_AMOUNT && <BBNFeeAmount amount={BBN_FEE_AMOUNT} />}
      <div className="divider my-4" />
      <Total />
    </div>
  );
};

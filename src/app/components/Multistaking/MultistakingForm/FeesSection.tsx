import { BBNFeeAmount } from "@/app/components/Staking/DelegationForm/components/BBNFeeAmount";
import { BTCFeeAmount } from "@/app/components/Staking/DelegationForm/components/BTCFeeAmount";
import { Total } from "@/app/components/Staking/DelegationForm/components/Total";
import { BBN_FEE_AMOUNT } from "@/app/constants";
import { useStakingState } from "@/app/state/StakingState";

import { BTCFeeRate } from "./BTCFeeRate";

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

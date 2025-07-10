import { BBNFeeAmount } from "@/ui/legacy/components/Staking/DelegationForm/components/BBNFeeAmount";
import { BTCFeeAmount } from "@/ui/legacy/components/Staking/DelegationForm/components/BTCFeeAmount";
import { Total } from "@/ui/legacy/components/Staking/DelegationForm/components/Total";
import { BBN_FEE_AMOUNT } from "@/ui/legacy/constants";
import { useStakingState } from "@/ui/legacy/state/StakingState";

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

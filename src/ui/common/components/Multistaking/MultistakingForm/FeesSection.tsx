import { BBNFeeAmount } from "@/ui/common/components/Staking/DelegationForm/components/BBNFeeAmount";
import { BTCFeeAmount } from "@/ui/common/components/Staking/DelegationForm/components/BTCFeeAmount";
import { Total } from "@/ui/common/components/Staking/DelegationForm/components/Total";
import { BBN_FEE_AMOUNT } from "@/ui/common/constants";
import { useStakingState } from "@/ui/common/state/StakingState";

import { BTCFeeRate } from "./BTCFeeRate";
import { SubSection } from "./SubSection";

export const FeesSection = () => {
  const { stakingInfo } = useStakingState();

  return (
    <SubSection className="flex flex-col justify-between w-full content-center gap-4">
      <div className="flex flex-col gap-6 p-4">
        <BTCFeeRate defaultRate={stakingInfo?.defaultFeeRate} />
        <BTCFeeAmount />
        {BBN_FEE_AMOUNT && <BBNFeeAmount amount={BBN_FEE_AMOUNT} />}
        <div className="divider my-4" />
        <Total />
      </div>
    </SubSection>
  );
};

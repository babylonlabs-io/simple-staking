import { FinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";
import { MultistakingState } from "@/ui/common/state/MultistakingState";
import { StakingState } from "@/ui/common/state/StakingState";

import { MultistakingForm } from "./MultistakingForm";

export function MultistakingFormWrapper() {
  return (
    <StakingState>
      <MultistakingState>
        <FinalityProviderBsnState>
          <MultistakingForm />
        </FinalityProviderBsnState>
      </MultistakingState>
    </StakingState>
  );
}

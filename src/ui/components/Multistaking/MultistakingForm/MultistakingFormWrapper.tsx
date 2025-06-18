import { FinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";
import { MultistakingState } from "@/ui/state/MultistakingState";
import { StakingState } from "@/ui/state/StakingState";

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

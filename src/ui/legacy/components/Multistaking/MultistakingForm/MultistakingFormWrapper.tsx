import { FinalityProviderBsnState } from "@/ui/legacy/state/FinalityProviderBsnState";
import { MultistakingState } from "@/ui/legacy/state/MultistakingState";
import { StakingState } from "@/ui/legacy/state/StakingState";

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

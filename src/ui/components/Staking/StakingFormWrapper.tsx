import { FinalityProviderState } from "@/ui/state/FinalityProviderState";
import { StakingState } from "@/ui/state/StakingState";

import { StakingForm } from "./StakingForm";

export function StakingFormWrapper() {
  return (
    <StakingState>
      <FinalityProviderState>
        <StakingForm />
      </FinalityProviderState>
    </StakingState>
  );
}

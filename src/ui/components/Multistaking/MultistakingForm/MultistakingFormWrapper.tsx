import { MultistakingState } from "@/ui/state/MultistakingState";
import { StakingState } from "@/ui/state/StakingState";

import { MultistakingForm } from "./MultistakingForm";

export function MultistakingFormWrapper() {
  return (
    <StakingState>
      <MultistakingState>
        <MultistakingForm />
      </MultistakingState>
    </StakingState>
  );
}

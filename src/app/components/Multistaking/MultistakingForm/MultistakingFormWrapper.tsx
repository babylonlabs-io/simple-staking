import { MultistakingState } from "@/app/state/MultistakingState";
import { StakingState } from "@/app/state/StakingState";

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

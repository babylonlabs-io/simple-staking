import { StakingState } from "@/app/state/StakingState";
import { StakingStateV2 } from "@/app/state/StakingStateV2";

import { MultistakingForm } from "./MultistakingForm";

export function MultistakingFormWrapper() {
  return (
    <StakingState>
      <StakingStateV2>
        <MultistakingForm />
      </StakingStateV2>
    </StakingState>
  );
}

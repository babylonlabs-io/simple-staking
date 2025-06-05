import { StakingState } from "@/app/state/StakingState";

import { MultistakingForm } from "./MultistakingForm";

export function MultistakingFormWrapper() {
  return (
    <StakingState>
      <MultistakingForm />
    </StakingState>
  );
}

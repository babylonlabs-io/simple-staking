import { MultistakingState } from "@/app/state/StakingV2State";

import { MultistakingForm } from "./MultistakingForm";

export function MultistakingFormWrapper() {
  return (
    <MultistakingState>
      <MultistakingForm />
    </MultistakingState>
  );
}

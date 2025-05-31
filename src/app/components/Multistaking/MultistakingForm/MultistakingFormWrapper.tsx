import { MultistakingState } from "@/app/state/MultistakingState";

import { MultistakingForm } from "./MultistakingForm";


export function MultistakingFormWrapper() {
  return (
    <MultistakingState>
      <MultistakingForm />
    </MultistakingState>
  );
}

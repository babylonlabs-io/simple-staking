import { PropsWithChildren } from "react";

import { ValidatorState } from "./ValidatorState";

export function BabyState({ children }: PropsWithChildren) {
  return <ValidatorState>{children}</ValidatorState>;
}

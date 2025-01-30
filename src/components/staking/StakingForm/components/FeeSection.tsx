import { useFieldState } from "@babylonlabs-io/bbn-core-ui";
import { PropsWithChildren } from "react";

const FIELDS = ["finalityProvider", "term", "amount"];

export const FeeSection = ({ children }: PropsWithChildren) => {
  const fieldStates = useFieldState(FIELDS);

  if (fieldStates.some((field) => field.invalid || !field.isDirty)) {
    return null;
  }

  return <>{children}</>;
};

import { useFormContext, useFormState } from "@babylonlabs-io/bbn-core-ui";
import { PropsWithChildren } from "react";

const FILEDS = ["finalityProvider", "term", "amount"];

export const FeeSection = ({ children }: PropsWithChildren) => {
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: FILEDS });
  const fieldStates = FILEDS.map((fieldName) =>
    getFieldState(fieldName, formState),
  );

  if (fieldStates.some((field) => field.invalid || !field.isDirty)) {
    return null;
  }

  return <>{children}</>;
};

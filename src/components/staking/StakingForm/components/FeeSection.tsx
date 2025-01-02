import { useFormState } from "@babylonlabs-io/bbn-core-ui";
import { PropsWithChildren } from "react";

export const FeeSection = ({ children }: PropsWithChildren) => {
  const { errors } = useFormState({
    name: ["finalityProvider", "term", "amount"],
  });

  if (errors.finalityProvider || errors.term || errors.amount) {
    return null;
  }

  return <>{children}</>;
};

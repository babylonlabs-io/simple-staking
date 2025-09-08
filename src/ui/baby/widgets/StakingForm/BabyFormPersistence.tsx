import { useFormContext, useWatch } from "@babylonlabs-io/core-ui";
import { useEffect, useMemo, useRef } from "react";

import {
  useFormPersistenceState,
  type BabyStakeDraft,
} from "@/ui/common/state/FormPersistenceState";

export function BabyFormPersistence() {
  const { setValue, control } = useFormContext<BabyStakeDraft>();
  const { babyStakeDraft, setBabyStakeDraft } = useFormPersistenceState();
  const hasHydratedRef = useRef(false);

  const amount = useWatch({ control, name: "amount" });
  const validatorAddresses = useWatch({ control, name: "validatorAddresses" });
  const feeAmount = useWatch({ control, name: "feeAmount" });

  // Hydrate once on mount
  useEffect(() => {
    if (hasHydratedRef.current) return;

    if (babyStakeDraft) {
      if (babyStakeDraft.amount !== undefined) {
        setValue("amount", babyStakeDraft.amount, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
      if (babyStakeDraft.validatorAddresses !== undefined) {
        setValue("validatorAddresses", babyStakeDraft.validatorAddresses, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
      if (babyStakeDraft.feeAmount !== undefined) {
        setValue("feeAmount", babyStakeDraft.feeAmount, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }

    hasHydratedRef.current = true;
  }, [babyStakeDraft, setValue]);

  const draft = useMemo(
    () => ({
      amount,
      validatorAddresses,
      feeAmount,
    }),
    [amount, validatorAddresses, feeAmount],
  );

  // Persist on change
  useEffect(() => {
    setBabyStakeDraft(draft);
  }, [draft, setBabyStakeDraft]);

  return null;
}

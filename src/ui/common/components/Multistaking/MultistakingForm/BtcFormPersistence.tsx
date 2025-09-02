import { useFormContext, useWatch } from "@babylonlabs-io/core-ui";
import { useEffect, useMemo, useRef } from "react";

import {
  useFormPersistenceState,
  type BtcStakeDraft,
} from "@/ui/common/state/FormPersistenceState";
import { useStakingState } from "@/ui/common/state/StakingState";

export function BtcFormPersistence() {
  const { setValue, control } = useFormContext<BtcStakeDraft>();
  const { btcStakeDraft, setBtcStakeDraft } = useFormPersistenceState();
  const { stakingInfo } = useStakingState();
  const hasHydratedRef = useRef(false);

  const finalityProviders = useWatch({ control, name: "finalityProviders" });
  const amount = useWatch({ control, name: "amount" });
  const term = useWatch({ control, name: "term" });
  const feeRate = useWatch({ control, name: "feeRate" });
  const feeAmount = useWatch({ control, name: "feeAmount" });

  // Hydrate once on mount
  useEffect(() => {
    if (hasHydratedRef.current) return;

    if (btcStakeDraft) {
      if (btcStakeDraft.finalityProviders) {
        setValue("finalityProviders", btcStakeDraft.finalityProviders, {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
      if (btcStakeDraft.amount !== undefined) {
        setValue("amount", btcStakeDraft.amount, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
      if (btcStakeDraft.term !== undefined) {
        setValue("term", btcStakeDraft.term, {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
      if (btcStakeDraft.feeRate !== undefined) {
        setValue("feeRate", btcStakeDraft.feeRate, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
      if (btcStakeDraft.feeAmount !== undefined) {
        setValue("feeAmount", btcStakeDraft.feeAmount, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    } else if (
      stakingInfo?.defaultFeeRate !== undefined &&
      (feeRate === undefined || feeRate === "")
    ) {
      // Apply default only when no persisted draft and no current value
      setValue("feeRate", stakingInfo.defaultFeeRate.toString(), {
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false,
      });
    }

    hasHydratedRef.current = true;
  }, [btcStakeDraft, stakingInfo?.defaultFeeRate, feeRate, setValue]);

  const draft = useMemo(
    () => ({
      finalityProviders,
      amount,
      term,
      feeRate,
      feeAmount,
    }),
    [finalityProviders, amount, term, feeRate, feeAmount],
  );

  // Persist on change
  useEffect(() => {
    setBtcStakeDraft(draft);
  }, [draft, setBtcStakeDraft]);

  return null;
}

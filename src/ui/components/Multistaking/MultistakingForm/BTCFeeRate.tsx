import { Button, useFormContext, useWatch } from "@babylonlabs-io/core-ui";
import { useEffect, useMemo, useState } from "react";
import { FaPen } from "react-icons/fa6";

import { FeeItem } from "@/ui/components/Staking/DelegationForm/components/FeeItem";
import { FeeModal } from "@/ui/components/Staking/FeeModal";
import { useStakingService } from "@/ui/hooks/services/useStakingService";

interface FeeFiledProps {
  defaultRate?: number;
}

export function BTCFeeRate({ defaultRate = 0 }: FeeFiledProps) {
  const [visible, setVisibility] = useState(false);
  const feeRate = useWatch({ name: "feeRate" });
  const { setValue, setError, clearErrors } = useFormContext();
  const { calculateFeeAmount } = useStakingService();

  const amount = useWatch({ name: "amount" });
  const term = useWatch({ name: "term" });
  const finalityProviders = useWatch({ name: "finalityProviders" });

  const validFinalityProviders = useMemo(
    () => Object.values(finalityProviders ?? {}) as string[],
    [finalityProviders],
  );

  useEffect(() => {
    setValue("feeRate", defaultRate.toString(), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [defaultRate, setValue]);

  // TODO: useFieldState instead of multiple useWatch
  useEffect(() => {
    let cancelled = false;

    const run = () => {
      try {
        if (!validFinalityProviders.length || !amount || !term || !feeRate) {
          if (cancelled) return;
          setValue("feeAmount", "0", {
            shouldValidate: false,
            shouldDirty: false,
            shouldTouch: false,
          });
          return;
        }

        const feeAmount = calculateFeeAmount({
          finalityProviders: validFinalityProviders,
          amount: Number(amount),
          term: Number(term),
          feeRate: Number(feeRate),
        });

        if (cancelled) return;

        clearErrors("feeAmount");
        setValue("feeAmount", feeAmount.toString(), {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      } catch (e: any) {
        if (cancelled) return;
        setValue("feeAmount", "0", {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
        setError("feeAmount", {
          type: "custom",
          message: e.message,
        });
      }
    };

    Promise.resolve().then(run);

    return () => {
      cancelled = true;
    };
  }, [
    feeRate,
    amount,
    term,
    validFinalityProviders,
    setValue,
    setError,
    clearErrors,
    calculateFeeAmount,
  ]);

  return (
    <FeeItem title="Network Fee Rate">
      <span>{feeRate} Sats/vB</span>

      <Button
        //@ts-expect-error - fix type issue in core-ui
        type="button"
        size="small"
        variant="outlined"
        className="pl-1 w-6 h-6 text-secondary-strokeDark"
        onClick={() => void setVisibility(true)}
      >
        <FaPen size={16} className="text-secondary-strokeDark" />
      </Button>

      <FeeModal
        open={visible}
        onClose={() => void setVisibility(false)}
        onSubmit={(value) =>
          setValue("feeRate", value.toString(), {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          })
        }
      />
    </FeeItem>
  );
}

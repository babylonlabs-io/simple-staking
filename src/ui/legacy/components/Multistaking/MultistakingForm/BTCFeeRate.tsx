import { Button, useField, useFormContext } from "@babylonlabs-io/core-ui";
import { useEffect, useMemo, useState } from "react";
import { FaPen } from "react-icons/fa6";

import { FeeItem } from "@/ui/legacy/components/Staking/DelegationForm/components/FeeItem";
import { FeeModal } from "@/ui/legacy/components/Staking/FeeModal";
import { useStakingService } from "@/ui/legacy/hooks/services/useStakingService";

interface FeeFiledProps {
  defaultRate?: number;
}

export function BTCFeeRate({ defaultRate = 0 }: FeeFiledProps) {
  const [visible, setVisibility] = useState(false);
  const { setValue, setError, clearErrors } = useFormContext();
  const { calculateFeeAmount } = useStakingService();

  // Use useField instead of multiple useWatch calls to prevent infinite loops
  const { value: feeRate } = useField({ name: "feeRate" });
  const { value: amount } = useField({ name: "amount" });
  const { value: term } = useField({ name: "term" });
  const { value: finalityProviders } = useField({ name: "finalityProviders" });

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

  // Calculate fee amount when dependencies change
  useEffect(() => {
    try {
      if (!validFinalityProviders.length || !amount || !term || !feeRate) {
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

      clearErrors("feeAmount");
      setValue("feeAmount", feeAmount.toString(), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    } catch (e: any) {
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
  }, [
    validFinalityProviders,
    amount,
    term,
    feeRate,
    calculateFeeAmount,
    setValue,
    setError,
    clearErrors,
  ]);

  return (
    <FeeItem title="Network Fee Rate">
      <span>{feeRate || defaultRate} sats/vB</span>

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

import { Button, useField, useFormContext } from "@babylonlabs-io/core-ui";
import { useEffect, useMemo, useState } from "react";
import { FaPen } from "react-icons/fa6";

import { FeeItem } from "@/ui/common/components/Staking/DelegationForm/components/FeeItem";
import { FeeModal } from "@/ui/common/components/Staking/FeeModal";
import { useStakingService } from "@/ui/common/hooks/services/useStakingService";

interface FeeFiledProps {
  defaultRate?: number;
}

export function BTCFeeRate({ defaultRate = 0 }: FeeFiledProps) {
  const [visible, setVisibility] = useState(false);
  const { value: feeRate } = useField({ name: "feeRate" });
  const { setValue, setError, clearErrors } = useFormContext();
  const { calculateFeeAmount } = useStakingService();

  const { value: amount } = useField({ name: "amount" });
  const { value: term } = useField({ name: "term" });
  const { value: finalityProviders } = useField({ name: "finalityProviders" });
  const { value: feeAmount } = useField({ name: "feeAmount" });

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

  useEffect(() => {
    try {
      if (
        !validFinalityProviders.length ||
        !amount ||
        !term ||
        !feeRate ||
        feeRate === "0"
      ) {
        if (feeAmount && feeAmount !== "0") {
          setValue("feeAmount", "0", {
            shouldValidate: false,
            shouldDirty: false,
            shouldTouch: false,
          });
        }
        return;
      }

      const newFeeAmount = calculateFeeAmount({
        finalityProviders: validFinalityProviders,
        amount: Number(amount),
        term: Number(term),
        feeRate: Number(feeRate),
      }).toString();
      if (feeAmount !== newFeeAmount) {
        clearErrors("feeAmount");
        setValue("feeAmount", newFeeAmount, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
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
    feeAmount,
    calculateFeeAmount,
    setValue,
    setError,
    clearErrors,
  ]);

  return (
    <FeeItem title="Network Fee Rate">
      <span>{feeRate} sats/vB</span>

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

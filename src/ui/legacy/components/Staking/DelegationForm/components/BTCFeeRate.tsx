import { Button, useFormContext, useWatch } from "@babylonlabs-io/core-ui";
import { useEffect, useState } from "react";
import { FaPen } from "react-icons/fa6";

import { FeeModal } from "@/ui/legacy/components/Staking/FeeModal";
import { useStakingService } from "@/ui/legacy/hooks/services/useStakingService";

import { FeeItem } from "./FeeItem";

interface FeeFiledProps {
  defaultRate?: number;
}

export function BTCFeeRate({ defaultRate = 0 }: FeeFiledProps) {
  const [visible, setVisibility] = useState(false);
  const feeRate = useWatch({ name: "feeRate" });
  const finalityProviders = useWatch({ name: "finalityProviders" });
  const amount = useWatch({ name: "amount" });
  const term = useWatch({ name: "term" });
  const { setValue, setError, clearErrors } = useFormContext();
  const { calculateFeeAmount } = useStakingService();

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
        !finalityProviders ||
        !Array.isArray(finalityProviders) ||
        finalityProviders.length === 0 ||
        !amount ||
        !term ||
        !feeRate
      ) {
        setValue("feeAmount", "0", {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
        return;
      }

      const feeAmount = calculateFeeAmount({
        finalityProviders,
        amount,
        term,
        feeRate,
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
    finalityProviders,
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

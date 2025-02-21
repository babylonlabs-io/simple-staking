import { Button, useFormContext, useWatch } from "@babylonlabs-io/bbn-core-ui";
import { useEffect, useState } from "react";
import { FaPen } from "react-icons/fa6";

import { useStakingService } from "@/app/hooks/services/useStakingService";

import { FeeItem } from "./FeeItem";
import { FeeModal } from "./FeeModal";

interface FeeFiledProps {
  defaultRate?: number;
}

export function BTCFeeRate({ defaultRate = 0 }: FeeFiledProps) {
  const [visible, setVisibility] = useState(false);
  const feeRate = useWatch({ name: "feeRate" });
  const { setValue, getValues } = useFormContext();
  const { calculateFeeAmount } = useStakingService();

  useEffect(() => {
    setValue("feeRate", defaultRate.toString(), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [defaultRate, setValue]);

  useEffect(() => {
    const { finalityProvider, amount, term } = getValues();

    const feeAmount = calculateFeeAmount({
      finalityProvider,
      amount,
      term,
      feeRate,
    });

    setValue("feeAmount", feeAmount.toString(), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [feeRate, getValues, setValue, calculateFeeAmount]);

  return (
    <FeeItem title="Network Fee Rate">
      <span>{feeRate} Sats/vB</span>

      <Button
        //@ts-ignore - fix type issue in core-ui
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

import {
  HiddenField,
  useFormContext,
  useWatch,
} from "@babylonlabs-io/bbn-core-ui";
import { useThrottle } from "@uidotdev/usehooks";
import { useEffect } from "react";

import { useStakingService } from "@/app/hooks/services/useStakingService";

const CALCULATION_DELAY = 50;

export function FeeAmountField() {
  const { calculateFeeAmount } = useStakingService();
  const { setValue, getValues } = useFormContext();
  const feeRate = useWatch({ name: "feeRate" });
  const throttledFeeRate = useThrottle(feeRate, CALCULATION_DELAY);

  useEffect(() => {
    const { finalityProvider, amount, term } = getValues();

    const feeAmount = calculateFeeAmount({
      finalityProvider,
      amount,
      term,
      feeRate: throttledFeeRate,
    });

    setValue("feeAmount", feeAmount.toString(), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [throttledFeeRate, getValues, setValue, calculateFeeAmount]);

  return <HiddenField displayError name="feeAmount" defaultValue="0" />;
}

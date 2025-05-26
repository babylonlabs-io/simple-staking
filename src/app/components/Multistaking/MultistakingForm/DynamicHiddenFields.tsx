import { HiddenField, useFormContext } from "@babylonlabs-io/core-ui";
import { useEffect } from "react";

interface Props {
  stakingInfo?: {
    minStakingTimeBlocks: number;
    maxStakingTimeBlocks: number;
    defaultStakingTimeBlocks?: number;
  };
}

export function DynamicHiddenFields({ stakingInfo }: Props) {
  const { setValue, getValues } = useFormContext();

  useEffect(() => {
    if (!stakingInfo) return;

    const currentTerm = Number(getValues("term"));
    const termToSet =
      stakingInfo.defaultStakingTimeBlocks ||
      stakingInfo.maxStakingTimeBlocks ||
      stakingInfo.minStakingTimeBlocks ||
      1;

    if (!currentTerm || currentTerm !== termToSet) {
      setValue("term", termToSet.toString(), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [stakingInfo, setValue, getValues]);

  return (
    <>
      <HiddenField name="term" defaultValue="1" />
      <HiddenField name="feeRate" defaultValue="0" />
      <HiddenField name="feeAmount" defaultValue="0" />
      <HiddenField name="finalityProvider" defaultValue="" />
    </>
  );
}

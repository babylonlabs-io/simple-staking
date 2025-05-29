import { HiddenField } from "@babylonlabs-io/core-ui";

interface Props {
  stakingInfo?: {
    minStakingTimeBlocks: number;
    maxStakingTimeBlocks: number;
    defaultStakingTimeBlocks?: number;
  };
}

export function DynamicHiddenFields({ stakingInfo }: Props) {
  return (
    <>
      <HiddenField
        name="term"
        defaultValue={stakingInfo?.defaultStakingTimeBlocks?.toString()}
      />
      <HiddenField name="feeRate" defaultValue="0" />
      <HiddenField name="feeAmount" defaultValue="0" />
      <HiddenField name="finalityProvider" defaultValue="" />
    </>
  );
}

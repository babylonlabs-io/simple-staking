import { HiddenField } from "@babylonlabs-io/bbn-core-ui";

import { SliderField } from "./SliderField";

interface FeeFiledProps {
  expanded: boolean;
  min?: number;
  max?: number;
  defaultRate?: number;
  onExpand?: () => void;
}

export function FeeRateField({
  expanded,
  defaultRate = 0,
  min = 0,
  max = 0,
  onExpand,
}: FeeFiledProps) {
  if (!expanded) {
    return (
      <div>
        <HiddenField
          key={defaultRate}
          name="feeRate"
          defaultValue={defaultRate?.toString()}
        />

        <button
          className="btn btn-sm btn-link w-full no-underline"
          onClick={onExpand}
        >
          Use Custom
        </button>
      </div>
    );
  }

  return (
    <SliderField
      name="feeRate"
      min={min}
      max={max}
      defaultValue={defaultRate.toString()}
      scale={
        <div className="w-full flex justify-between text-xs px-0 items-center">
          <span className="opacity-50">{min} sat/vB</span>

          <span className="opacity-50">{max} sat/vB</span>
        </div>
      }
    />
  );
}

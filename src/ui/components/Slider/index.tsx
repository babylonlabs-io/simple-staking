"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";

import { cx } from "../../utils/cx";
import { Icon } from "../Icon";
import type { IconSize } from "../Icon/types";

export interface SliderProps extends SliderPrimitive.SliderProps {
  className?: string;
  label?: string;
  thumbClassName?: string;
  thumbIconSize?: IconSize | 0;
}

export const Slider = ({
  defaultValue,
  max,
  step,
  label,
  className,
  thumbClassName,
  thumbIconSize = 28,
  ...props
}: SliderProps) => {
  const rootClassNames = cx(
    "h-12 flex items-center relative select-none touch-none cursor-pointer outline-none",
    className,
  );

  return (
    <SliderPrimitive.Root
      defaultValue={defaultValue}
      max={max}
      step={step}
      aria-label={label}
      className={rootClassNames}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 outline-none grow bg-itemSecondaryMute">
        <SliderPrimitive.Range className="absolute h-full outline-none bg-backgroundPrimaryOnDefault dark:bg-brandDefault" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cx(
          "flex items-center justify-center w-12 h-12 transition-transform rounded-full outline-none bg-backgroundPrimaryOnDefault text-backgroundPrimaryDefault cursor-grab dark:bg-brandDefault active:cursor-grabbing active:scale-95",
          thumbClassName,
        )}
      >
        {thumbIconSize !== 0 && (
          <Icon iconKey="chevronSelector" size={thumbIconSize} />
        )}
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
};

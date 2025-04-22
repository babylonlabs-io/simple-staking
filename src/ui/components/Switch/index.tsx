"use client";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import type { ComponentPropsWithRef } from "react";

import { cx } from "../../utils";

export type SwitchProps = ComponentPropsWithRef<
  typeof SwitchPrimitives.Root
> & {
  leftLabel?: string;
  rightLabel?: string;
};

export const Switch = ({
  className,
  id,
  leftLabel,
  rightLabel,
  checked,
  onCheckedChange,
  ...props
}: SwitchProps) => (
  <div className="flex items-center gap-2 select-none">
    {leftLabel && (
      <label
        className={cx(
          "font-semibold uppercase text-callout text-itemSecondaryDefault",
        )}
        htmlFor={id}
      >
        {leftLabel}
      </label>
    )}
    <SwitchPrimitives.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cx(
        "peer inline-flex h-[22px] w-[35px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:bg-backgroundInverseActive focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-itemPrimaryDefault data-[state=unchecked]:bg-itemSecondaryDefault",
        className,
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cx(
          "pointer-events-none block size-[18px] rounded-full bg-backgroundPrimaryDefault shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[15px] data-[state=unchecked]:translate-x-[2px]",
        )}
      />
    </SwitchPrimitives.Root>
    {rightLabel && (
      <label
        className={cx(
          "font-semibold uppercase text-callout transition-colors",
          checked ? "text-itemPrimaryDefault" : "text-itemSecondaryDefault",
        )}
        htmlFor={id}
      >
        {rightLabel}
      </label>
    )}
  </div>
);
Switch.displayName = SwitchPrimitives.Root.displayName;

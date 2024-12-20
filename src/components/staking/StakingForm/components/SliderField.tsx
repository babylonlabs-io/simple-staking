import { FormControl, useField } from "@babylonlabs-io/bbn-core-ui";
import { type JSX } from "react";
import { twMerge } from "tailwind-merge";

type SliderFieldProps = {
  name: string;
  defaultValue?: string;
  label?: string | JSX.Element;
  hint?: string | JSX.Element;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  shouldUnregister?: boolean;
  scale?: JSX.Element;
};

export function SliderField({
  name,
  label,
  hint,
  min,
  max,
  defaultValue,
  className,
  disabled,
  autoFocus,
  shouldUnregister,
  scale,
}: SliderFieldProps) {
  const { invalid, error, ...inputProps } = useField({
    name,
    disabled,
    defaultValue,
    autoFocus,
    shouldUnregister,
  });

  return (
    <FormControl
      state={invalid ? "error" : "default"}
      label={label}
      hint={invalid ? error : hint}
    >
      <input
        type="range"
        min={min}
        max={max}
        className={twMerge(
          "range range-xs mb-2 opacity-60",
          invalid ? "range-error" : "range-primary",
          className,
        )}
        {...inputProps}
      />

      {scale}
    </FormControl>
  );
}

import { Input, useField } from "@babylonlabs-io/core-ui";
import type { ChangeEventHandler } from "react";

const NUMBER_REG_EXP = /^-?\d*\.?\d*$/;

interface AmountFieldProps {
  autoFocus?: boolean;
  className?: string;
}

export function AmountField({
  autoFocus = false,
  className,
}: AmountFieldProps) {
  const {
    ref,
    value = "",
    onChange,
    onBlur,
  } = useField({ name: "amount", defaultValue: "0" });

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (NUMBER_REG_EXP.test(e.target.value)) {
      onChange(e.target.value);
    }
  };

  return (
    <Input
      ref={ref}
      inputMode="decimal"
      pattern="^-?\\d*\\.?\\d*$"
      type="text"
      value={value || ""}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder="0"
      autoFocus={autoFocus}
      className={
        className ??
        "text-lg bg-transparent text-right w-24 outline-none border-transparent focus:border-transparent"
      }
    />
  );
}

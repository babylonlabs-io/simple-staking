import { Input, Text } from "@babylonlabs-io/bbn-core-ui";
import { ChangeEventHandler, forwardRef } from "react";

import { WarningTooltip } from "./WarningTooltip";

interface CustomLabelProps {
  label: string;
  amount: string;
  disabled: boolean;
  warning: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export const CustomLabel = forwardRef<HTMLInputElement, CustomLabelProps>(
  ({ label, amount, disabled, warning, onChange }, ref) => (
    <Text
      as="span"
      className="flex items-center gap-4 [&>.bbn-input]:h-10"
      variant="body1"
    >
      <b>{label}</b>{" "}
      <Input
        ref={ref}
        type="number"
        value={amount}
        disabled={disabled}
        suffix={
          <Text className="whitespace-nowrap text-primary inline-flex items-center gap-2">
            {warning && <WarningTooltip />}
            sats vB
          </Text>
        }
        onChange={onChange}
      />
    </Text>
  ),
);

CustomLabel.displayName = "CustomLabel";

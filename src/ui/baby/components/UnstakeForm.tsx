import { Button } from "@babylonlabs-io/core-ui";

import { AmountInput } from "./AmountInput";
import { ValidatorSelector } from "./ValidatorSelector";

interface Validator {
  operatorAddress: string;
  description?: {
    moniker: string;
  };
}

interface UnstakeFormProps {
  validators: Validator[];
  validatorAddress: string;
  setValidatorAddress: (address: string) => void;
  unstakeAmount: string;
  setUnstakeAmount: (amount: string) => void;
  onUnstake: () => void;
  loading: boolean;
}

export function UnstakeForm({
  validators,
  validatorAddress,
  setValidatorAddress,
  unstakeAmount,
  setUnstakeAmount,
  onUnstake,
  loading,
}: UnstakeFormProps) {
  return (
    <div className="bg-secondary-highlight text-accent-primary p-6 rounded">
      <h2 className="text-xl font-semibold mb-4">Unstake</h2>
      <div className="space-y-4">
        <ValidatorSelector
          validators={validators}
          value={validatorAddress}
          onChange={setValidatorAddress}
          label="Validator"
        />
        <AmountInput
          value={unstakeAmount}
          onChange={setUnstakeAmount}
          label="Amount (tBABY)"
          placeholder="Enter tBABY amount to unstake (e.g., 5)"
        />
        <Button
          fluid
          onClick={onUnstake}
          disabled={loading || !validatorAddress || !unstakeAmount}
        >
          {loading ? "Unstaking..." : "Unstake tBABY"}
        </Button>
      </div>
    </div>
  );
}

import { Button } from "@babylonlabs-io/core-ui";

import { AmountInput } from "./AmountInput";
import { ValidatorSelector } from "./ValidatorSelector";

interface Validator {
  operatorAddress: string;
  description?: {
    moniker: string;
  };
}

interface StakeFormProps {
  validators: Validator[];
  validatorAddress: string;
  setValidatorAddress: (address: string) => void;
  stakeAmount: string;
  setStakeAmount: (amount: string) => void;
  onStake: () => void;
  loading: boolean;
}

export function StakeForm({
  validators,
  validatorAddress,
  setValidatorAddress,
  stakeAmount,
  setStakeAmount,
  onStake,
  loading,
}: StakeFormProps) {
  return (
    <div className="bg-secondary-highlight text-accent-primary p-6 rounded">
      <h2 className="text-xl font-semibold mb-4">Stake</h2>
      <div className="space-y-4">
        <ValidatorSelector
          validators={validators}
          value={validatorAddress}
          onChange={setValidatorAddress}
          label="Validator"
        />
        <AmountInput
          value={stakeAmount}
          onChange={setStakeAmount}
          label="Amount (tBABY)"
          placeholder="Enter tBABY amount to stake (e.g., 10)"
        />
        <Button
          fluid
          onClick={onStake}
          disabled={loading || !validatorAddress || !stakeAmount}
        >
          {loading ? "Staking..." : "Stake tBABY"}
        </Button>
      </div>
    </div>
  );
}

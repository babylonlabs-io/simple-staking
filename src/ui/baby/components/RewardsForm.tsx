import { Button } from "@babylonlabs-io/core-ui";

import { ValidatorSelector } from "./ValidatorSelector";

interface Validator {
  operatorAddress: string;
  description?: {
    moniker: string;
  };
}

interface RewardsFormProps {
  validators: Validator[];
  validatorAddress: string;
  setValidatorAddress: (address: string) => void;
  onClaimRewards: () => void;
  loading: boolean;
}

export function RewardsForm({
  validators,
  validatorAddress,
  setValidatorAddress,
  onClaimRewards,
  loading,
}: RewardsFormProps) {
  return (
    <div className="bg-secondary-highlight text-accent-primary p-6 rounded">
      <h2 className="text-xl font-semibold mb-4">Rewards</h2>
      <div className="space-y-4">
        <ValidatorSelector
          validators={validators}
          value={validatorAddress}
          onChange={setValidatorAddress}
          label="Validator"
        />
        <Button
          fluid
          onClick={onClaimRewards}
          disabled={loading || !validatorAddress}
        >
          {loading ? "Claiming..." : "Claim Rewards"}
        </Button>
      </div>
    </div>
  );
}

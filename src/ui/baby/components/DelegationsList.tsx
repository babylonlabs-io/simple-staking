import { Button } from "@babylonlabs-io/core-ui";

import { ubbnToBaby } from "@/ui/legacy/utils/bbn";

interface Delegation {
  delegation?: {
    validatorAddress: string;
  };
  balance?: {
    amount: string;
    denom: string;
  };
}

interface Validator {
  operatorAddress: string;
  description?: {
    moniker: string;
  };
}

interface DelegationsListProps {
  delegations: Delegation[];
  validators: Validator[];
  getRewardsForValidator: (validatorAddress: string) => number;
  onUnstakeAll: (validatorAddress: string, amount: string) => void;
  onClaimRewards: (validatorAddress: string) => Promise<void>;
  loading: boolean;
}

export function DelegationsList({
  delegations,
  validators,
  getRewardsForValidator,
  onUnstakeAll,
  onClaimRewards,
  loading,
}: DelegationsListProps) {
  if (delegations.length === 0) {
    return null;
  }

  return (
    <div className="bg-secondary-highlight text-accent-primary p-6 rounded mb-6">
      <h2 className="text-xl font-semibold mb-4">My Delegations</h2>
      <div className="space-y-2">
        {delegations.map((delegation, index) => {
          const validatorAddress =
            delegation.delegation?.validatorAddress || "";
          const stakedAmount = ubbnToBaby(
            parseFloat(delegation.balance?.amount || "0"),
          );
          const rewardsAmount = getRewardsForValidator(validatorAddress);

          return (
            <div
              key={index}
              className="flex justify-between items-center p-3 rounded bg-secondary-highlight text-accent-primary"
            >
              <div>
                <p className="font-medium">
                  {validators.find(
                    (v) => v.operatorAddress === validatorAddress,
                  )?.description?.moniker || validatorAddress}
                </p>
                <p className="text-sm text-gray-600">
                  Staked: {stakedAmount.toLocaleString()} tBABY
                </p>
                {rewardsAmount > 0 && (
                  <p className="text-sm text-green-600">
                    Rewards: {rewardsAmount.toLocaleString()} tBABY
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    onUnstakeAll(validatorAddress, stakedAmount.toString())
                  }
                >
                  Unstake All
                </Button>
                {rewardsAmount > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onClaimRewards(validatorAddress)}
                    disabled={loading}
                  >
                    {loading ? "Claiming..." : "Claim"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

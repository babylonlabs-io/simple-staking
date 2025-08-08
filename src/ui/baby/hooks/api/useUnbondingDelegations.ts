import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";

const BABY_UNBONDING_DELEGATIONS_KEY = "BABY_UNBONDING_DELEGATIONS_KEY";

interface CosmosUnbondingDelegationEntry {
  creation_height: string;
  completion_time: string;
  initial_balance: string;
  balance: string;
}

interface CosmosUnbondingDelegationResponse {
  delegator_address: string;
  validator_address: string;
  entries: CosmosUnbondingDelegationEntry[];
}

interface NormalizedUnbondingDelegation {
  delegatorAddress: string;
  validatorAddress: string;
  entries: {
    creationHeight: string;
    completion_time: string;
    initial_balance: string;
    balance: string;
  }[];
}

export function useUnbondingDelegations({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const { bech32Address } = useCosmosWallet();

  return useClientQuery<NormalizedUnbondingDelegation[]>({
    queryKey: [BABY_UNBONDING_DELEGATIONS_KEY, bech32Address],
    queryFn: async (): Promise<NormalizedUnbondingDelegation[]> => {
      if (!bech32Address) {
        return [];
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BABY_LCD_URL}/cosmos/staking/v1beta1/delegators/${bech32Address}/unbonding_delegations`,
        );

        if (response.ok) {
          const data = await response.json();
          const unbondingResponses: CosmosUnbondingDelegationResponse[] =
            data.unbonding_responses || [];

          return unbondingResponses.map((unbonding) => ({
            delegatorAddress: unbonding.delegator_address,
            validatorAddress: unbonding.validator_address,
            entries: unbonding.entries.map((entry) => ({
              creationHeight: entry.creation_height,
              completion_time: entry.completion_time,
              initial_balance: entry.initial_balance,
              balance: entry.balance,
            })),
          }));
        } else {
          return [];
        }
      } catch {
        return [];
      }
    },
    enabled: Boolean(bech32Address) && enabled,
  });
}

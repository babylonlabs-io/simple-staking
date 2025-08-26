import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";

export const BABY_UNBONDING_DELEGATIONS_KEY = "BABY_UNBONDING_DELEGATIONS_KEY";

export function useUnbondingDelegations({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const { bech32Address } = useCosmosWallet();
  const { lcdUrl } = getNetworkConfigBBN();

  return useClientQuery({
    queryKey: [BABY_UNBONDING_DELEGATIONS_KEY, bech32Address],
    queryFn: async () => {
      if (!bech32Address) {
        return [];
      }

      try {
        const response = await fetch(
          `${lcdUrl}/cosmos/staking/v1beta1/delegators/${bech32Address}/unbonding_delegations`,
        );

        if (response.ok) {
          const data = await response.json();
          return data.unbonding_responses || [];
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

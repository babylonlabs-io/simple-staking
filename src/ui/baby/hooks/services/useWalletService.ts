import { useBabyBalance } from "@/ui/baby/hooks/api/useBabyBalance";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";

export function useWalletService() {
  const { bech32Address } = useCosmosWallet();
  const { data: balance = 0n, refetch: refetchBalance } =
    useBabyBalance(bech32Address);

  return { balance, bech32Address, refetchBalance };
}

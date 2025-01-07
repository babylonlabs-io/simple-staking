import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";

import { useClientQuery } from "../useClient";

export const BTC_BALANCE_KEY = "BTC_BALANCE";

export function useBTCBalance() {
  const {
    getBalance: getBTCBalance,
    connected: btcConnected,
    address,
  } = useBTCWallet();

  return useClientQuery({
    queryKey: [BTC_BALANCE_KEY],
    queryFn: () => getBTCBalance(address),
    enabled: btcConnected,
  });
}

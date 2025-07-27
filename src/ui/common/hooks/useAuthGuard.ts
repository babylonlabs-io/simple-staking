import {
  useChainConnector,
  useWalletConnect,
} from "@babylonlabs-io/wallet-connector";

import { useHealthCheck } from "@/ui/common/hooks/useHealthCheck";

export function useAuthGuard() {
  const { connected } = useWalletConnect();
  const { isGeoBlocked, isLoading } = useHealthCheck();
  const isConnected = connected && !isGeoBlocked && !isLoading;
  const btc = useChainConnector("BTC");
  const baby = useChainConnector("BBN");

  return { connected: isConnected, loading: !btc || !baby || isLoading };
}

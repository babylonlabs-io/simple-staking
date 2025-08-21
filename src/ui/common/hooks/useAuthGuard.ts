import {
  useChainConnector,
  useWalletConnect,
} from "@babylonlabs-io/wallet-connector";

export function useAuthGuard() {
  const { connected } = useWalletConnect();
  const btc = useChainConnector("BTC");
  const baby = useChainConnector("BBN");

  return { connected, loading: !btc || !baby };
}

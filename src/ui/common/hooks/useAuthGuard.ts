import {
  useChainConnector,
  useWalletConnect,
} from "@babylonlabs-io/wallet-connector";

export function useAuthGuard() {
  const { connected } = useWalletConnect();
  const baby = useChainConnector("BBN");

  return { connected, loading: !baby };
}

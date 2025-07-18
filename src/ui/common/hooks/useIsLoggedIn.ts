import { useWalletConnect } from "@babylonlabs-io/wallet-connector";

import { useHealthCheck } from "./useHealthCheck";

export function useIsLoggedIn(): boolean {
  const { connected } = useWalletConnect();
  const { isGeoBlocked, isLoading } = useHealthCheck();

  return connected && !isGeoBlocked && !isLoading;
}

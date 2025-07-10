import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import {
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";

import { useHealthCheck } from "@/ui/legacy/hooks/useHealthCheck";

interface AuthGuardProps {
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  fallback,
}: PropsWithChildren<AuthGuardProps>) {
  const [displayComponent, setDisplayComponent] = useState(false);

  const { connected } = useWalletConnect();
  const { isGeoBlocked, isLoading } = useHealthCheck();
  const isConnected = connected && !isGeoBlocked && !isLoading;

  useEffect(() => {
    setDisplayComponent(isConnected);
  }, [isConnected]);

  return <>{displayComponent ? children : fallback}</>;
}

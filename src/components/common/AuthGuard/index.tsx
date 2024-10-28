import {
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";

import { useWalletConnection } from "@/app/context/wallet/WalletConnectionProvider";

interface AuthGuardProps {
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  fallback,
}: PropsWithChildren<AuthGuardProps>) {
  const { isConnected } = useWalletConnection();
  const [displayComponent, setDisplayComponent] = useState(false);

  useEffect(() => {
    setDisplayComponent(isConnected);
  }, [isConnected]);

  return displayComponent ? children : fallback;
}

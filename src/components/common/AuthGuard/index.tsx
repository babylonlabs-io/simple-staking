import type { PropsWithChildren, ReactNode } from "react";

import { useWalletConnection } from "@/app/context/wallet/WalletConnectionProvider";

interface AuthGuardProps {
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  fallback,
}: PropsWithChildren<AuthGuardProps>) {
  const { isConnected } = useWalletConnection();

  return isConnected ? children : fallback;
}

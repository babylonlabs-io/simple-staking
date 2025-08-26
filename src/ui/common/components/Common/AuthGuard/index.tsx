import { type PropsWithChildren, type ReactNode } from "react";

import { useAuthGuard } from "@/ui/common/hooks/useAuthGuard";

interface AuthGuardProps {
  fallback?: ReactNode;
  spinner?: ReactNode;
  geoBlocked?: boolean;
}

export function AuthGuard({
  children,
  fallback,
  spinner,
  geoBlocked,
}: PropsWithChildren<AuthGuardProps>) {
  const { connected, loading } = useAuthGuard();

  if (!connected || geoBlocked) {
    return loading ? spinner : fallback;
  }

  return children;
}

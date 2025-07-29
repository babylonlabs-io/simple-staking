import { type PropsWithChildren, type ReactNode } from "react";

import { useAuthGuard } from "@/ui/common/hooks/useAuthGuard";

interface AuthGuardProps {
  fallback?: ReactNode;
  spinner?: ReactNode;
}

export function AuthGuard({
  children,
  fallback,
  spinner,
}: PropsWithChildren<AuthGuardProps>) {
  const { connected, loading } = useAuthGuard();

  if (!connected) {
    return loading ? spinner : fallback;
  }

  return children;
}

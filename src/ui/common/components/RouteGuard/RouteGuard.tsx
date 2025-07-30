import { PropsWithChildren } from "react";
import { Navigate } from "react-router";

import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";

interface RouteGuardProps {
  redirectTo?: string;
}

export function RouteGuard({
  children,
  redirectTo,
}: PropsWithChildren<RouteGuardProps>) {
  return (
    <AuthGuard
      fallback={redirectTo ? <Navigate to={redirectTo} replace /> : null}
    >
      {children}
    </AuthGuard>
  );
}

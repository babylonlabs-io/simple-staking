import { type PropsWithChildren, type ReactNode } from "react";

import { GenericError } from "@/ui/common/components/Error/GenericError";
import { Loading } from "@/ui/common/components/Loading/Loading";
import { useHealthCheck } from "@/ui/common/hooks/useHealthCheck";

interface HealthGuardProps {
  fallback?: ReactNode;
  spinner?: ReactNode;
}

export function HealthGuard({
  children,
  fallback,
  spinner = <Loading />,
}: PropsWithChildren<HealthGuardProps>) {
  const { isApiNormal, isGeoBlocked, isLoading, apiMessage } = useHealthCheck();

  // Show loading while checking health
  if (isLoading) {
    return spinner;
  }

  // Show geo-block error
  if (isGeoBlocked) {
    return (
      fallback || (
        <GenericError
          errorMessage="Access to BABY staking is restricted in your region."
          noFeedback
        />
      )
    );
  }

  // Show API maintenance/error
  if (!isApiNormal) {
    return (
      fallback || (
        <GenericError
          errorMessage={
            apiMessage ||
            "BABY staking is temporarily unavailable. Please try again later."
          }
          noFeedback
        />
      )
    );
  }

  return children;
}

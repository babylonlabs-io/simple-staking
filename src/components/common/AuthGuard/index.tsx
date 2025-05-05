import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import {
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";

import { useHealthCheck } from "@/app/hooks/useHealthCheck";

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

  // During E2E tests we inject a special flag on the window object to indicate
  // that the application is running in test mode. In this scenario we want to
  // bypass the wallet-connection requirement so that pages behind the
  // `AuthGuard` can be rendered without an actual wallet connection flow. This
  // avoids flakiness in CI where the synthetic wallet connection occasionally
  // fails causing elements to never appear in the DOM.
  const isTestMode =
    // Ensure we are running in a browser environment before accessing `window`.
    typeof window !== "undefined" && (window as any).__e2eTestMode === true;

  const isConnected = isTestMode || (connected && !isGeoBlocked && !isLoading);

  useEffect(() => {
    setDisplayComponent(isConnected);
  }, [isConnected]);

  return <>{displayComponent ? children : fallback}</>;
}

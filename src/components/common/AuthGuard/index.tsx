import { useWalletConnect } from "@babylonlabs-io/bbn-wallet-connect";
import {
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";

interface AuthGuardProps {
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  fallback,
}: PropsWithChildren<AuthGuardProps>) {
  const { connected } = useWalletConnect();
  const [displayComponent, setDisplayComponent] = useState(false);

  useEffect(() => {
    setDisplayComponent(connected);
  }, [connected]);

  return displayComponent ? children : fallback;
}

import { getIsolationScope, setUser } from "@sentry/react";
import { useCallback } from "react";

export const useSentryUser = () => {
  const updateUser = useCallback((updates: Record<string, any>) => {
    const currentScope = getIsolationScope();
    const currentUser = currentScope.getUser();
    setUser({
      ...currentUser,
      ...updates,
    });
  }, []);

  return { updateUser };
};

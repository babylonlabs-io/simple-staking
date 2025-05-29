import { getIsolationScope, setUser } from "@sentry/nextjs";
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

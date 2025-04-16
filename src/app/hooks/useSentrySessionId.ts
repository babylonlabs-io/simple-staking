import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

/**
 * useSentrySessionId
 * The UUID is unique per browser tab/window and resets when the session ends.
 */
export function useSentrySessionId() {
  const [uuid, setUuid] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let sessionId = sessionStorage.getItem("sentry_session_uuid");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("sentry_session_uuid", sessionId);
    }
    setUuid(sessionId);
    Sentry.setUser({ id: sessionId });
  }, []);

  return uuid;
}

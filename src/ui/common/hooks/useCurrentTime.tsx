import { useEffect, useState } from "react";

import { ONE_MINUTE } from "@/ui/common/constants";

export function useCurrentTime(refreshInterval: number = 60 * ONE_MINUTE) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(Date.now());
    }, refreshInterval);

    return () => clearInterval(timerId);
  }, [refreshInterval]);

  return currentTime;
}

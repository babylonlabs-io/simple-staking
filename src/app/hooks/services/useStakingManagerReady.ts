import { useEffect, useState } from "react";

import { useStakingManagerService } from "./useStakingManagerService";

const POLLING_INTERVAL_MS = 5e3;

export function useStakingManagerReady() {
  const { createBtcStakingManager } = useStakingManagerService();
  const [ready, setReady] = useState<boolean>(() =>
    Boolean(createBtcStakingManager()),
  );

  useEffect(() => {
    if (ready) return;

    const id = setInterval(() => {
      if (createBtcStakingManager()) {
        setReady(true);
      }
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(id);
  }, [ready, createBtcStakingManager]);

  return ready;
}

import { useEffect, useState } from "react";

import { useStakingManagerService } from "./useStakingManagerService";

export function useStakingManagerReady() {
  const { createBtcStakingManager } = useStakingManagerService();
  const [ready, setReady] = useState<boolean>(() =>
    Boolean(createBtcStakingManager()),
  );

  useEffect(() => {
    if (!ready && createBtcStakingManager()) {
      setReady(true);
    }
  }, [ready, createBtcStakingManager]);

  return ready;
}

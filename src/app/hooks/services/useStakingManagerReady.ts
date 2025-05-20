import { useEffect, useState } from "react";

import { useStakingManagerService } from "./useStakingManagerService";

export function useStakingManagerReady() {
  const { createBtcStakingManager } = useStakingManagerService();
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const stakingManager = createBtcStakingManager();
    if (stakingManager) {
      setReady(true);
    }
  }, [createBtcStakingManager]);

  return ready;
}

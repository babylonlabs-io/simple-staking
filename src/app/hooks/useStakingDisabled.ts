import { useMemo } from "react";

import { STAKING_DISABLED } from "../constants";

/**
 * Hook to check if staking is disabled based on the environment variable
 * @returns {boolean} Whether staking is disabled
 */
export function useStakingDisabled(): boolean {
  // extend this hook to check if
  // [x] manually disable staking in FE using a flag
  // [ ] API service to detect bootstrapping and other unhealthy state
  // [ ] simple-staking to disable staking if rpc node not producing blocks for X minutes
  const isDisabled = useMemo(() => {
    return STAKING_DISABLED;
  }, []);

  return isDisabled;
}

import { useMemo } from "react";

import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";

/**
 * Hook to determine if the allow list is active and expose allow list data
 * @returns {object} - Object containing isActive flag and allow list data
 */
export function useStakingExpansionAllowList() {
  const { data: networkInfo } = useNetworkInfo();

  const stakingExpansionAllowList =
    networkInfo?.stakingStatus?.stakingExpansionAllowList;

  const isActive = useMemo(() => {
    if (!stakingExpansionAllowList) {
      return false;
    }

    if (stakingExpansionAllowList.isExpired) {
      return false;
    }

    return true;
  }, [stakingExpansionAllowList]);

  return {
    isAllowListActive: isActive,
    allowList: stakingExpansionAllowList,
  };
}

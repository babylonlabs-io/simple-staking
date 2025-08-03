import { useMemo } from "react";

import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";

/**
 * Hook to determine if the allow list is active and expose allow list data
 * @returns {object} - Object containing isActive flag and allow list data
 */
export function useAllowList() {
  const { data: networkInfo } = useNetworkInfo();

  const allowList = networkInfo?.stakingStatus?.allowList;

  const isActive = useMemo(() => {
    if (!allowList) {
      return false;
    }

    if (allowList.isExpired) {
      return false;
    }

    return true;
  }, [allowList]);

  return {
    isAllowListActive: isActive,
    allowList,
  };
}

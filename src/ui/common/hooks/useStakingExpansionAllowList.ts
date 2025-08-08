import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";
import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";

/**
 * Hook to determine if the allow list is active and expose allow list data
 * @returns {object} - Object containing isActive flag and allow list data
 */
export function useStakingExpansionAllowList() {
  const { data: networkInfo } = useNetworkInfo();

  const isMultiStakingAllowListInForce =
    FeatureFlagService.IsPhase3Enabled &&
    networkInfo?.stakingStatus?.isMultiStakingAllowListInForce;

  return {
    isMultiStakingAllowListInForce,
  };
}

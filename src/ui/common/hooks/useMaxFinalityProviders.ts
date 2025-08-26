import { DEFAULT_MAX_FINALITY_PROVIDERS } from "@/ui/common/constants";
import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";
import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";

/**
 * Hook to get the maximum number of finality providers allowed.
 *
 * @returns The maximum number of finality providers allowed
 */
export function useMaxFinalityProviders(): number {
  const { data: networkInfo } = useNetworkInfo();

  const networkMaxProviders =
    networkInfo?.params.bbnStakingParams.latestParam.maxFinalityProviders;

  // The maxFinalityProviders is controlled by the FF - only when Phase 3 enabled
  const maxFinalityProviders =
    FeatureFlagService.IsPhase3Enabled && networkMaxProviders
      ? networkMaxProviders
      : DEFAULT_MAX_FINALITY_PROVIDERS;

  return maxFinalityProviders;
}

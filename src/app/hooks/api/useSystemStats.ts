import { useAPIQuery } from "@/app/hooks/api/useApi";

export const BTC_TIP_HEIGHT_KEY = "API_STATS";

const defaultValues = {
  activeTvl: 0,
  totalTvl: 0,
  activeDelegations: 0,
  totalDelegations: 0,
  activeStakers: 0,
  totalStakers: 0,
  activeFinalityProviders: 0,
  totalFinalityProviders: 0,
};

export function useSystemStats() {
  return useAPIQuery({
    queryKey: ["API_STATS"],
    queryFn: () => Promise.resolve(defaultValues),
    initialData: defaultValues,
    placeholderData: defaultValues,
  });
}

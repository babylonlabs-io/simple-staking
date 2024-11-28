import { useFinalityProviders } from "@/app/hooks/api/useFinalityProviders";

export function useFinalityProviderService() {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useFinalityProviders();

  return {
    finalityProviders: data?.finalityProviders,
    hasNextPage,
    isLoading: isFetchingNextPage,
    fetchNextPage,
  };
}

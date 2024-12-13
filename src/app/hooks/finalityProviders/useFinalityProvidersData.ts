"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { FinalityProvider as FinalityProviderInterface } from "@/app/types/finalityProviders";

export const useFinalityProvidersData = (
  initialProviders: FinalityProviderInterface[] | undefined,
) => {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("fp") || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredProviders = useMemo(
    () =>
      initialProviders?.filter((fp) => {
        const matchesMoniker = fp.description?.moniker
          ?.toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
        const matchesPk = fp.btcPk
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

        return matchesMoniker || matchesPk;
      }),
    [initialProviders, debouncedSearchTerm],
  );

  const handleSearch = useCallback((searchValue: string) => {
    setSearchTerm(searchValue);
  }, []);

  return {
    filteredProviders,
    handleSearch,
    searchValue: searchTerm,
  };
};

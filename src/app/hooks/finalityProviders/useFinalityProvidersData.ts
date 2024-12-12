"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { FinalityProvider as FinalityProviderInterface } from "@/app/types/finalityProviders";

export const useFinalityProvidersData = (
  initialProviders: FinalityProviderInterface[] | undefined,
) => {
  const [filteredProviders, setFilteredProviders] = useState(initialProviders);
  const searchParams = useSearchParams();

  // Initialize with search param if it exists
  useEffect(() => {
    const fpParam = searchParams.get("fp");

    if (fpParam) {
      handleSearch(fpParam);
    } else {
      setFilteredProviders(initialProviders);
    }
  }, [initialProviders]); // Only run on initial load and when providers change

  const handleSearch = useCallback(
    (searchTerm: string) => {
      const filtered = initialProviders?.filter((fp) => {
        const matchesMoniker = fp.description?.moniker
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesPk = fp.btcPk
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        return matchesMoniker || matchesPk;
      });

      setFilteredProviders(filtered);
    },
    [initialProviders],
  );

  return {
    filteredProviders,
    setFilteredProviders,
    handleSearch,
  };
};

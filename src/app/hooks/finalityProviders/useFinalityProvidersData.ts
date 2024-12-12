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
    console.log("[useFinalityProvidersData] Initial fp param:", fpParam);

    if (fpParam) {
      handleSearch(fpParam);
    } else {
      setFilteredProviders(initialProviders);
    }
  }, [initialProviders]); // Only run on initial load and when providers change

  const handleSearch = useCallback(
    (searchTerm: string) => {
      console.log("[useFinalityProvidersData] Searching for:", searchTerm);
      console.log(
        "[useFinalityProvidersData] Initial providers:",
        initialProviders?.length,
      );

      const filtered = initialProviders?.filter((fp) => {
        const matchesMoniker = fp.description?.moniker
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesPk = fp.btcPk
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        console.log("[useFinalityProvidersData] Provider:", {
          moniker: fp.description?.moniker,
          pk: fp.btcPk,
          matchesMoniker,
          matchesPk,
        });

        return matchesMoniker || matchesPk;
      });

      console.log(
        "[useFinalityProvidersData] Filtered results:",
        filtered?.length,
      );
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

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FinalityProvider as FinalityProviderInterface,
  SortDirection,
  SortField,
} from "@/app/types/finalityProviders";

export const useFinalityProvidersData = (
  initialProviders: FinalityProviderInterface[] | undefined,
) => {
  const [filteredProviders, setFilteredProviders] = useState(initialProviders);
  const [sortField, setSortField] = useState<SortField>("stakeSat");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    setFilteredProviders(initialProviders);
  }, [initialProviders]);

  const handleSearch = useCallback(
    (searchTerm: string) => {
      const filtered = initialProviders?.filter(
        (fp) =>
          fp.description?.moniker
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          fp.btcPk.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProviders(filtered);
    },
    [initialProviders],
  );

  const sortFinalityProviders = useCallback(
    (
      providers: FinalityProviderInterface[] | undefined,
      field: SortField,
      direction: SortDirection,
    ) => {
      if (!providers || providers.length === 0) {
        return [];
      }

      return [...providers].sort((a, b) => {
        const aValue = getSortValue(a, field);
        const bValue = getSortValue(b, field);
        return direction === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : bValue > aValue
            ? 1
            : -1;
      });
    },
    [],
  );

  const sortedProviders = useMemo(
    () => sortFinalityProviders(filteredProviders, sortField, sortDirection),
    [filteredProviders, sortField, sortDirection, sortFinalityProviders],
  );

  return {
    filteredProviders,
    setFilteredProviders,
    handleSearch,
    sortedProviders,
    setSortField,
    setSortDirection,
    sortFinalityProviders,
  };
};

const getSortValue = (
  provider: FinalityProviderInterface,
  field: SortField,
) => {
  switch (field) {
    case "moniker":
      return provider.description?.moniker || "";
    case "btcPk":
      return provider.btcPk;
    case "stakeSat":
      return provider.activeTVLSat;
    case "commission":
      return parseFloat(provider.commission);
    default:
      return 0;
  }
};

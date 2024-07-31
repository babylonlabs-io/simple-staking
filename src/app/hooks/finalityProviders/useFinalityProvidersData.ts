import { useCallback, useEffect, useState } from "react";

import { FinalityProvider as FinalityProviderInterface } from "@/app/types/finalityProviders";

export const useFinalityProvidersData = (
  initialProviders: FinalityProviderInterface[] | undefined,
) => {
  const [filteredProviders, setFilteredProviders] = useState(initialProviders);

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

  return {
    filteredProviders,
    setFilteredProviders,
    handleSearch,
  };
};

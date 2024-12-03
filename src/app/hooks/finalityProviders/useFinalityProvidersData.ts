import { useEffect, useRef, useState } from "react";

import { FinalityProvider } from "@/app/types/finalityProviders";

export const useFinalityProvidersData = (
  initialProviders: FinalityProvider[] | undefined,
  isRefetchingFinalityProviders: boolean,
  isFetchedFinalityProviders: boolean,
) => {
  const finalityProvidersRef = useRef<FinalityProvider[] | undefined>(
    undefined,
  );
  const [filteredFinalityProviders, setFilteredFinalityProviders] = useState<
    FinalityProvider[] | undefined
  >(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (
      !initialProviders ||
      isRefetchingFinalityProviders ||
      !isFetchedFinalityProviders
    ) {
      return;
    }

    if (
      !finalityProvidersRef.current ||
      finalityProvidersRef.current.length === 0
    ) {
      // on initial load, we shuffle the fp result
      const shuffledProviders = [...initialProviders];
      for (let i = shuffledProviders.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledProviders[i], shuffledProviders[j]] = [
          shuffledProviders[j],
          shuffledProviders[i],
        ];
      }
      finalityProvidersRef.current = shuffledProviders;
    } else {
      const newProvidersMap = new Map<string, FinalityProvider>();
      initialProviders.forEach((provider) => {
        newProvidersMap.set(provider.btcPk, provider);
      });

      let hasChanges = false;
      const updatedProviders = finalityProvidersRef.current.map((provider) => {
        const newProvider = newProvidersMap.get(provider.btcPk);
        if (newProvider) {
          newProvidersMap.delete(provider.btcPk);
          if (!shallowCompareFP(provider, newProvider)) {
            hasChanges = true;
            return newProvider;
          }
        }
        return provider;
      });

      const newProviders = Array.from(newProvidersMap.values());
      if (newProviders.length > 0 || hasChanges) {
        finalityProvidersRef.current = [...updatedProviders, ...newProviders];
      }
    }
  }, [initialProviders, isRefetchingFinalityProviders]);

  useEffect(() => {
    if (!finalityProvidersRef.current) {
      setFilteredFinalityProviders(undefined);
      return;
    }

    if (!searchTerm) {
      setFilteredFinalityProviders(finalityProvidersRef.current);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = finalityProvidersRef.current.filter(
      (fp) =>
        fp.description?.moniker?.toLowerCase().includes(searchTermLower) ||
        fp.btcPk.toLowerCase().includes(searchTermLower),
    );
    setFilteredFinalityProviders(filtered);
  }, [searchTerm, finalityProvidersRef.current]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return {
    finalityProviders: finalityProvidersRef.current,
    filteredFinalityProviders,
    handleSearch,
  };
};

const shallowCompareFP = (objA: FinalityProvider, objB: FinalityProvider) => {
  return (
    objA.btcPk === objB.btcPk &&
    objA.commission === objB.commission &&
    objA.activeTVLSat === objB.activeTVLSat &&
    objA.description?.moniker === objB.description?.moniker &&
    objA.description?.website === objB.description?.website
  );
};

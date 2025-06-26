import { useMemo } from "react";

import { FinalityProviderItem } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderItem";
import { Bsn } from "@/ui/types/bsn";
import { FinalityProvider } from "@/ui/types/finalityProviders";

interface SelectedProvidersListProps {
  selectedFPs: Record<string, string>;
  bsnList: Bsn[];
  finalityProviderMap: Map<string, FinalityProvider>;
  onRemove: (bsnId?: string) => void;
}

export function SelectedProvidersList({
  selectedFPs,
  bsnList,
  finalityProviderMap,
  onRemove,
}: SelectedProvidersListProps) {
  const values = useMemo(() => Object.entries(selectedFPs), [selectedFPs]);

  if (values.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {values.map(([bsnId, providerId]) => {
        const finalityProvider = finalityProviderMap.get(providerId);
        const bsn = bsnList.find((b) => b.id === bsnId);

        if (!finalityProvider) return null;

        return (
          <FinalityProviderItem
            key={providerId}
            finalityProvider={finalityProvider}
            bsn={bsn}
            onRemove={onRemove}
          />
        );
      })}
    </div>
  );
}

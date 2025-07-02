import { useMemo } from "react";

import { BsnFinalityProviderItem } from "@/ui/common/components/Multistaking/BsnFinalityProviderField/BsnFinalityProviderItem";

interface SelectedProvidersListProps {
  selectedFPs: Record<string, string>;
  onRemove: (bsnId?: string) => void;
}

export function SelectedProvidersList({
  selectedFPs,
  onRemove,
}: SelectedProvidersListProps) {
  const values = useMemo(() => Object.entries(selectedFPs), [selectedFPs]);

  if (values.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {values.map(([bsnId, providerId]) => (
        <BsnFinalityProviderItem
          key={providerId}
          bsnId={bsnId}
          providerId={providerId}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

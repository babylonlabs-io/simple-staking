import { FinalityProviderItem } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderItem";
import { SelectedProvider } from "@/ui/state/FinalityProviderBsnState";

interface SelectedProvidersListProps {
  selectedProviders: SelectedProvider[];
  onRemove: (bsnId?: string) => void;
}

export function SelectedProvidersList({
  selectedProviders,
  onRemove,
}: SelectedProvidersListProps) {
  if (selectedProviders.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {selectedProviders.map(({ bsn, finalityProvider }) => (
        <FinalityProviderItem
          key={finalityProvider.btcPk}
          finalityProvider={finalityProvider}
          bsn={bsn}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

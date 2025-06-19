import { BsnFinalityProviderItem } from "@/ui/components/Multistaking/BsnFinalityProviderField/BsnFinalityProviderItem";

interface SelectedProvidersListProps {
  providerIds: string[];
  onRemove: (btcPk: string) => void;
}

export function SelectedProvidersList({
  providerIds,
  onRemove,
}: SelectedProvidersListProps) {
  if (providerIds.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {providerIds.map((providerId) => (
        <BsnFinalityProviderItem
          key={providerId}
          providerId={providerId}
          onRemove={() => onRemove(providerId)}
        />
      ))}
    </div>
  );
}

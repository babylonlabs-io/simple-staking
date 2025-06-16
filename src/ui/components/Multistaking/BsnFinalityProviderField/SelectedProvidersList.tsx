import { BsnFinalityProviderItem } from "@/ui/components/Multistaking/BsnFinalityProviderField/BsnFinalityProviderItem";
import type { FinalityProvider } from "@/ui/types/finalityProviders";

interface SelectedProvidersListProps {
  providers: FinalityProvider[];
  onRemove: (btcPk: string) => void;
}

export function SelectedProvidersList({
  providers,
  onRemove,
}: SelectedProvidersListProps) {
  if (providers.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {providers.map((provider) => (
        <BsnFinalityProviderItem
          key={provider.btcPk}
          provider={provider}
          onRemove={() => onRemove(provider.btcPk)}
        />
      ))}
    </div>
  );
}

import { useFormContext } from "@babylonlabs-io/core-ui";

import { FinalityProviderLogo } from "@/ui/components/Staking/FinalityProviders/FinalityProviderLogo";
import { FinalityProvider } from "@/ui/types/finalityProviders";
import { trim } from "@/ui/utils/trim";

export const FinalityProviderItem = ({
  provider,
  onRemove,
}: {
  provider: FinalityProvider & { chainType: string };
  onRemove: () => void;
}) => {
  const { setValue } = useFormContext();

  return (
    <div className="flex flex-row justify-between items-center">
      <div className="h-10 flex flex-row gap-2">
        <FinalityProviderLogo
          logoUrl={provider.logo_url}
          rank={provider.rank}
          moniker={provider.description?.moniker}
          className="w-10 h-10"
        />
        <div className="text-accent-primary flex items-center">
          {provider.description?.moniker ||
            trim(provider.btcPk, 8) ||
            "Selected FP"}
        </div>
      </div>
      <div
        onClick={() => {
          setValue("finalityProvider", "", {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
          onRemove();
        }}
        className="text-accent-primary text-xs tracking-[0.4px] bg-accent-secondary/20 px-2 py-0.5 rounded cursor-pointer"
      >
        Remove
      </div>
    </div>
  );
};

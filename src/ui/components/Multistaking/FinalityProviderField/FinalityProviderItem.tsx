import { useFormContext } from "@babylonlabs-io/core-ui";

import { FinalityProviderLogo } from "@/ui/components/Staking/FinalityProviders/FinalityProviderLogo";
import { useFinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";
import { trim } from "@/ui/utils/trim";

export const FinalityProviderItem = ({
  finalityProviderId,
  onRemove,
}: {
  finalityProviderId: string;
  onRemove: () => void;
}) => {
  const { setValue } = useFormContext();
  const { getFinalityProviderInfo } = useFinalityProviderBsnState();
  const finalityProviderInfo = getFinalityProviderInfo(finalityProviderId);

  if (!finalityProviderInfo) {
    return null;
  }

  return (
    <div className="flex flex-row justify-between items-center">
      <div className="h-10 flex flex-row gap-2">
        <FinalityProviderLogo
          logoUrl={finalityProviderInfo.logo_url}
          rank={finalityProviderInfo.rank}
          moniker={finalityProviderInfo.description?.moniker}
          className="w-10 h-10"
        />
        <div className="text-accent-primary flex items-center text-sm sm:text-base">
          {finalityProviderInfo.description?.moniker ||
            trim(finalityProviderInfo.btcPk, 8) ||
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
        className="text-accent-primary text-xs sm:text-sm tracking-[0.4px] bg-accent-secondary/20 px-2 py-0.5 rounded cursor-pointer"
      >
        Remove
      </div>
    </div>
  );
};

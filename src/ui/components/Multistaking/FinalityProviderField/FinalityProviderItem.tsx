import { Avatar, useFormContext } from "@babylonlabs-io/core-ui";

import { FinalityProviderLogo } from "@/ui/components/Staking/FinalityProviders/FinalityProviderLogo";
import { chainLogos } from "@/ui/constants";
import { Bsn } from "@/ui/types/bsn";
import { FinalityProvider } from "@/ui/types/finalityProviders";
import FeatureFlagService from "@/ui/utils/FeatureFlagService";
import { trim } from "@/ui/utils/trim";

interface FinalityProviderItemProps {
  finalityProvider: FinalityProvider;
  bsn?: Bsn; // Only present when phase-3 flag is enabled
  onRemove: (bsnId?: string) => void;
}

export const FinalityProviderItem = ({
  finalityProvider,
  bsn,
  onRemove,
}: FinalityProviderItemProps) => {
  const { setValue } = useFormContext();
  const isPhase3 = FeatureFlagService.IsPhase3Enabled;

  const renderBsnLogo = () => {
    if (!isPhase3 || !bsn) {
      return null;
    }

    const logoUrl =
      chainLogos[bsn.id === "" ? "babylon" : bsn.id] || chainLogos.placeholder;

    return (
      <Avatar
        url={logoUrl}
        alt={bsn.name}
        variant="rounded"
        size="tiny"
        className="mr-1"
      />
    );
  };

  const renderProviderInfo = () => {
    if (isPhase3) {
      return (
        <div className="text-accent-primary flex flex-col justify-center">
          <div className="text-xs text-accent-secondary flex items-center">
            {renderBsnLogo()}
            {finalityProvider.description?.moniker ||
              trim(finalityProvider.btcPk, 8) ||
              "BSN Provider"}
          </div>
          <div className="text-base text-accent-primary font-medium">
            {trim(finalityProvider.btcPk, 8) || "Selected FP"}
          </div>
        </div>
      );
    }

    return (
      <div className="text-accent-primary flex items-center text-sm sm:text-base">
        {finalityProvider.description?.moniker ||
          trim(finalityProvider.btcPk, 8) ||
          "Selected FP"}
      </div>
    );
  };

  return (
    <div className="flex flex-row justify-between items-center">
      <div className="h-10 flex flex-row gap-2">
        <FinalityProviderLogo
          logoUrl={finalityProvider.logo_url}
          rank={finalityProvider.rank}
          moniker={finalityProvider.description?.moniker}
          className="w-10 h-10"
        />
        {renderProviderInfo()}
      </div>

      <button
        onClick={() => {
          setValue("finalityProviders", [], {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
          onRemove(bsn?.id);
        }}
        className="text-accent-primary text-xs sm:text-sm tracking-[0.4px] bg-accent-secondary/20 px-2 py-0.5 rounded cursor-pointer"
      >
        Remove
      </button>
    </div>
  );
};

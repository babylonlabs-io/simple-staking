import { Avatar } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { FinalityProviderLogo } from "@/ui/components/Staking/FinalityProviders/FinalityProviderLogo";
import { chainLogos } from "@/ui/constants";
import { useFinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";
import { useFinalityProviderState } from "@/ui/state/FinalityProviderState";
import { Bsn } from "@/ui/types/bsn";
import FeatureFlagService from "@/ui/utils/FeatureFlagService";

export const BsnFinalityProviderItem = ({
  bsnId,
  providerId,
  onRemove,
}: {
  bsnId: string;
  providerId: string;
  onRemove: (bsnId?: string) => void;
}) => {
  const { bsnList } = useFinalityProviderBsnState();
  const { finalityProviderMap } = useFinalityProviderState();
  const isPhase3 = FeatureFlagService.IsPhase3Enabled;
  const provider = finalityProviderMap.get(providerId);

  const bsn = useMemo(
    () => bsnList.find((bsn) => bsn.id === bsnId),
    [bsnList, bsnId],
  );

  const renderBsnLogo = (bsn?: Bsn) => {
    if (!isPhase3 || !bsn) {
      return null;
    }

    const logoUrl = chainLogos[bsn.id || "babylon"] || chainLogos.placeholder;

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

  if (!provider) {
    return null;
  }

  return (
    <div className="flex flex-row justify-between items-center">
      <div className="h-10 flex flex-row gap-2">
        <FinalityProviderLogo
          logoUrl={provider.logo_url}
          rank={provider.rank}
          moniker={provider.description?.moniker}
          className="w-10 h-10"
        />
        <div className="text-accent-primary flex flex-col justify-center">
          <div className="text-xs text-accent-secondary flex items-center">
            {renderBsnLogo(bsn)}
            {bsn?.name}
          </div>
          <div className="text-base text-accent-primary font-medium">
            {provider.description?.moniker}
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          onRemove(bsnId);
        }}
        className="text-accent-primary text-xs tracking-[0.4px] bg-accent-secondary/20 px-2 py-0.5 rounded cursor-pointer"
      >
        Remove
      </button>
    </div>
  );
};

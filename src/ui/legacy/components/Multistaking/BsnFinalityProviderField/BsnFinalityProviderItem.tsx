import { Avatar } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { FinalityProviderLogo } from "@/ui/legacy/components/Staking/FinalityProviders/FinalityProviderLogo";
import { chainLogos } from "@/ui/legacy/constants";
import { useFinalityProviderBsnState } from "@/ui/legacy/state/FinalityProviderBsnState";
import { useFinalityProviderState } from "@/ui/legacy/state/FinalityProviderState";

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
  const provider = finalityProviderMap.get(providerId);

  const bsn = useMemo(
    () => bsnList.find((bsn) => bsn.id === bsnId),
    [bsnList, bsnId],
  );

  const renderBsnLogo = () => {
    if (!bsn || !provider) {
      return null;
    }

    const logoUrl = chainLogos[provider.chain || "babylon"];

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
          size="lg"
        />
        <div className="text-accent-primary flex flex-col justify-center">
          <div className="text-xs text-accent-secondary flex items-center">
            {renderBsnLogo()}
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

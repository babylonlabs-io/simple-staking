import { FinalityProviderLogo } from "@/ui/components/Staking/FinalityProviders/FinalityProviderLogo";
import { useFinalityProviderState } from "@/ui/state/FinalityProviderState";
import { trim } from "@/ui/utils/trim";

export const BsnFinalityProviderItem = ({
  bsnId,
  providerId,
  onRemove,
}: {
  bsnId: string;
  providerId: string;
  onRemove: (bsnId?: string) => void;
}) => {
  const { finalityProviderMap } = useFinalityProviderState();
  const provider = finalityProviderMap.get(providerId);

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
          <div className="text-xs text-accent-secondary">
            {provider.description?.moniker || "BSN Provider"}
          </div>
          <div className="text-base text-accent-primary font-medium">
            {trim(provider.btcPk, 8) || "Selected FP"}
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

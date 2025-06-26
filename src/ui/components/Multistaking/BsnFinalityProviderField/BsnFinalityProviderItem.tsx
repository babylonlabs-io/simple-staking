import { FinalityProviderLogo } from "@/ui/components/Staking/FinalityProviders/FinalityProviderLogo";
import { useFinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";
import { trim } from "@/ui/utils/trim";

export const BsnFinalityProviderItem = ({
  finalityProviderId,
  onRemove,
}: {
  finalityProviderId: string;
  onRemove: () => void;
}) => {
  console.log("finalityProviderId", finalityProviderId);
  const { getBsnNetworkInfo, getFinalityProviderInfo } =
    useFinalityProviderBsnState();
  const finalityProviderInfo = getFinalityProviderInfo(finalityProviderId);
  console.log("finalityProviderInfo", finalityProviderInfo);
  const bsnNetworkInfo = finalityProviderInfo?.bsnId
    ? getBsnNetworkInfo(finalityProviderInfo.bsnId)
    : null;

  if (!finalityProviderInfo) {
    return (
      <div className="flex flex-row justify-between items-center opacity-50">
        <div className="h-10 flex flex-row gap-2">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs">?</span>
          </div>
          <div className="text-accent-primary flex flex-col justify-center">
            <div className="text-xs text-accent-secondary">
              Provider Not Found
            </div>
            <div className="text-base text-accent-primary font-medium">
              {finalityProviderId.substring(0, 8)}...
            </div>
          </div>
        </div>

        <div
          onClick={onRemove}
          className="text-accent-primary text-xs tracking-[0.4px] bg-accent-secondary/20 px-2 py-0.5 rounded cursor-pointer"
        >
          Remove
        </div>
      </div>
    );
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
        <div className="text-accent-primary flex-col justify-center text-sm sm:text-base">
          {/* BSN Network Icon Prefix */}
          {bsnNetworkInfo && (
            <div className="flex items-center gap-1 mr-2">
              <img
                src={bsnNetworkInfo.icon}
                alt={bsnNetworkInfo.name}
                className="w-4 h-4"
              />
              <span className="text-xs text-accent-secondary">
                {bsnNetworkInfo.name}
              </span>
            </div>
          )}
          {finalityProviderInfo.description?.moniker ||
            trim(finalityProviderInfo.btcPk, 8) ||
            "Selected FP"}
        </div>
      </div>

      <div
        onClick={onRemove}
        className="text-accent-primary text-xs sm:text-sm tracking-[0.4px] bg-accent-secondary/20 px-2 py-0.5 rounded cursor-pointer"
      >
        Remove
      </div>
    </div>
  );
};

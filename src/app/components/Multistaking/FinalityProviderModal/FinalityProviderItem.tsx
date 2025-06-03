import { chainLogos, chainNames } from "@/app/constants";
import { FinalityProvider } from "@/app/types/finalityProviders";
import { trim } from "@/utils/trim";

const getChainLogo = (chainType: string) =>
  chainLogos[chainType as keyof typeof chainLogos] ?? chainLogos.placeholder;

const getChainName = (chainType: string) =>
  chainNames[chainType as keyof typeof chainNames] ?? chainNames.unknown;

export const FinalityProviderItem = ({
  provider,
  chainType,
  onRemove,
}: {
  provider: FinalityProvider & { chainType: string };
  chainType: string;
  onRemove: () => void;
}) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="h-10 flex flex-row gap-2">
        {/* Replace with KeybaseImage */}
        <div
          className={`w-10 h-10 text-sm flex items-center justify-center rounded-full bg-secondary-main text-accent-contrast`}
        >
          {provider.rank}
        </div>
        <div>
          <div className="flex flex-row gap-1 items-center">
            <img
              src={getChainLogo(chainType).src}
              alt={getChainName(chainType)}
              className="w-4 h-4 rounded-[2px]"
            />
            <div className="text-xs text-accent-secondary">
              {getChainName(chainType)}
            </div>
          </div>
          <div className="text-accent-primary">
            {provider.description?.moniker ||
              trim(provider.btcPk, 8) ||
              "Selected FP"}
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
};

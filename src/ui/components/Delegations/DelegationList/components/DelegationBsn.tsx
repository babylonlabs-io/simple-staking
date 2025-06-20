import { Avatar, AvatarGroup } from "@babylonlabs-io/core-ui";

import { chainLogos } from "@/ui/constants";
import { useFinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";
import { FinalityProvider } from "@/ui/types/finalityProviders";

type BsnLogoKey = keyof typeof chainLogos;

const getBsnLogo = (bsnName: string) => {
  const lowerCaseBsnName = bsnName.toLowerCase();
  if (lowerCaseBsnName in chainLogos) {
    return chainLogos[lowerCaseBsnName as BsnLogoKey];
  }
  return chainLogos.placeholder;
};

interface DelegationBsnProps {
  fps?: FinalityProvider[];
  onClick: () => void;
}

export const DelegationBsn = ({ fps = [], onClick }: DelegationBsnProps) => {
  const { getFinalityProvidersBsns } = useFinalityProviderBsnState();

  // Get unique BSNs for all finality providers
  const uniqueBsns = getFinalityProvidersBsns(fps);

  if (uniqueBsns.length === 0) {
    return (
      <div className="flex items-center">
        <Avatar
          alt="Babylon Genesis"
          url={chainLogos.babylon}
          size="small"
          className="w-6 h-6"
        />
      </div>
    );
  }

  if (uniqueBsns.length === 1) {
    const bsn = uniqueBsns[0];
    return (
      <div onClick={onClick} className="cursor-pointer flex items-center">
        <Avatar
          alt={bsn?.name || "Unknown BSN"}
          url={getBsnLogo(bsn?.name || "")}
          size="small"
          className="w-6 h-6"
        />
      </div>
    );
  }

  return (
    <div onClick={onClick} className="cursor-pointer">
      <AvatarGroup max={3} variant="circular">
        {uniqueBsns.map((bsn) => (
          <Avatar
            key={bsn?.id}
            alt={bsn?.name || "Unknown BSN"}
            url={getBsnLogo(bsn?.name || "")}
            size="small"
            className="w-6 h-6 border-2 border-white"
          />
        ))}
      </AvatarGroup>
    </div>
  );
};

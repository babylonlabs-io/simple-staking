import { Text } from "@babylonlabs-io/core-ui";
import { useState } from "react";

interface FinalityProviderLogoProps {
  logoUrl?: string;
  rank: number;
  moniker?: string;
  className?: string;
}

export const FinalityProviderLogo = ({
  logoUrl,
  rank,
  moniker,
  className = "size-6",
}: FinalityProviderLogoProps) => {
  const [imageError, setImageError] = useState(false);

  const fallbackLabel = moniker?.charAt(0).toUpperCase() ?? String(rank);

  return (
    <span className={`relative inline-block ${className}`}>
      {logoUrl && !imageError ? (
        <img
          src={logoUrl}
          alt={moniker || `Finality Provider ${rank}`}
          className="w-full h-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <Text
          as="span"
          className="inline-flex justify-center items-center w-full h-full bg-secondary-main text-accent-contrast rounded-full text-[0.6rem]"
        >
          {fallbackLabel}
        </Text>
      )}

      <span className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 flex items-center justify-center bg-secondary-main text-accent-contrast rounded-full text-[0.5rem] w-[50%] h-[50%] ring-2 ring-surface">
        {rank}
      </span>
    </span>
  );
};

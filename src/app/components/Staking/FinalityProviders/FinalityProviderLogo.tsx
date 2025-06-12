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

  // Show logo if available and not errored
  if (logoUrl && !imageError) {
    return (
      <img
        src={logoUrl}
        alt={moniker || `Finality Provider ${rank}`}
        className={`${className} rounded-full object-cover`}
        onError={() => setImageError(true)}
      />
    );
  }

  // Fallback to rank display
  return (
    <Text
      as="span"
      className={`inline-flex justify-center items-center bg-secondary-main text-accent-contrast ${className} rounded-full text-[0.6rem]`}
    >
      {rank}
    </Text>
  );
};

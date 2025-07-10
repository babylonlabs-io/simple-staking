import { Text } from "@babylonlabs-io/core-ui";
import { useState } from "react";
import { twJoin, twMerge } from "tailwind-merge";

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
    <span className={twMerge("relative inline-block", className)}>
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
          className="inline-flex justify-center items-center w-full h-full bg-secondary-main text-accent-contrast rounded-full text-[1rem]"
        >
          {fallbackLabel}
        </Text>
      )}

      <span
        className={twJoin(
          "absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 flex items-center justify-center bg-secondary-main text-accent-contrast rounded-full w-[50%] h-[50%] ring-2 ring-surface p-[5px]",
          String(rank).length === 1
            ? "text-[0.8rem]"
            : String(rank).length === 2
              ? "text-[0.6rem]"
              : "text-[0.4rem]",
        )}
      >
        {rank}
      </span>
    </span>
  );
};

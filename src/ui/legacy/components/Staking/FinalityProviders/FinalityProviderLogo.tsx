import { Text } from "@babylonlabs-io/core-ui";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface FinalityProviderLogoProps {
  logoUrl?: string;
  rank: number;
  moniker?: string;
  className?: string;
  size?: "lg" | "md" | "sm";
}

const STYLES = {
  lg: {
    logo: "size-10",
    subLogo: "text-[0.8rem]",
  },
  md: {
    logo: "size-6",
    subLogo: "text-[0.5rem]",
  },
  sm: {
    logo: "size-5",
    subLogo: "text-[0.4rem]",
  },
};

export const FinalityProviderLogo = ({
  logoUrl,
  rank,
  moniker,
  size = "md",
  className,
}: FinalityProviderLogoProps) => {
  const [imageError, setImageError] = useState(false);
  const styles = STYLES[size];

  const fallbackLabel = moniker?.charAt(0).toUpperCase() ?? String(rank);

  return (
    <span className={twMerge("relative inline-block", styles.logo, className)}>
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

      {/*<span
        className={twJoin(
          "absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 flex items-center justify-center bg-secondary-main text-accent-contrast rounded-full w-[50%] h-[50%] ring-2 ring-surface p-[5px]",
          styles.subLogo,
        )}
      >
        {rank}
      </span>*/}
    </span>
  );
};

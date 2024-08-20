import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

import darkIcon from "@/app/assets/icon-black.svg";
import lightIcon from "@/app/assets/icon-white.svg";

interface IconProps {}

export const Icon: React.FC<IconProps> = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const lightSelected = resolvedTheme === "light";

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // uses placeholder of babylon logo with primary color
  // since before theme is resolved, we don't know which logo to show
  if (!mounted) {
    return <span className="h-[24px] w-[24px]" />;
  }

  return (
    <span className="inline-block mx-2">
      <Image
        src={lightSelected ? darkIcon : lightIcon}
        alt="Babylon"
        width={24}
        height={24}
      />
    </span>
  );
};

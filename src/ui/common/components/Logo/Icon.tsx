import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import darkIcon from "@/ui/common/assets/icon-black.svg";
import lightIcon from "@/ui/common/assets/icon-white.svg";

export const Icon = () => {
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
      <img
        src={lightSelected ? darkIcon : lightIcon}
        alt="Babylon Genesis"
        width={24}
        height={24}
      />
    </span>
  );
};

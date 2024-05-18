import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

import darkLogo from "@/app/assets/logo-black.svg";
import lightLogo from "@/app/assets/logo-white.svg";
import darkIcon from "@/app/assets/icon-black.svg";
import lightIcon from "@/app/assets/icon-white.svg";

interface LogoProps {}

export const Logo: React.FC<LogoProps> = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const lightSelected = resolvedTheme === "light";

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex">
      <Image
        src={lightSelected ? darkLogo : lightLogo}
        alt="Babylon"
        className="hidden w-[9rem] md:flex"
      />
      <Image
        src={lightSelected ? darkIcon : lightIcon}
        alt="Babylon"
        className="flex w-[2.2rem] md:hidden"
      />
    </div>
  );
};

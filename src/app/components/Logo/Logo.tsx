import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

import darkLogo from "@/app/assets/logo-black.svg";
import lightLogo from "@/app/assets/logo-white.svg";

interface LogoProps {}

export const Logo: React.FC<LogoProps> = () => {
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
    return <div className="h-[40px] w-[159px]" />;
  }

  return (
    <div className="flex">
      <Image src={lightSelected ? darkLogo : lightLogo} alt="Babylon" />
    </div>
  );
};

import Image from "next/image";
import { useTheme } from "next-themes";

import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { ConnectSmall } from "../Connect/ConnectSmall";
import { TestingInfo } from "../TestingInfo/TestingInfo";
import darkLogo from "@/app/assets/logo-black.svg";
import lightLogo from "@/app/assets/logo-white.svg";
import darkIcon from "@/app/assets/icon-black.svg";
import lightIcon from "@/app/assets/icon-white.svg";

interface HeaderProps {
  onConnect: () => void;
  address: string;
  balance: number;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onConnect,
  address,
  balance,
  onDisconnect,
}) => {
  const { resolvedTheme } = useTheme();
  const lightSelected = resolvedTheme === "light";

  return (
    <nav>
      <div className="bg-base-300 shadow-sm">
        <div className="container mx-auto flex w-full items-center justify-between gap-4 p-6">
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
          <div className="flex flex-1">
            <div className="hidden flex-1 xl:flex">
              <TestingInfo />
            </div>
          </div>
          <ConnectSmall
            onConnect={onConnect}
            address={address}
            balance={balance}
            onDisconnect={onDisconnect}
          />
          {!address && <ThemeToggle />}
        </div>
      </div>
      <div className="container mx-auto flex w-full items-center p-6 pb-0 xl:hidden">
        <TestingInfo />
      </div>
    </nav>
  );
};

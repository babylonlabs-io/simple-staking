import { ConnectSmall } from "../Connect/ConnectSmall";
import { ConnectedSmall } from "../Connect/ConnectedSmall";
import { TestingInfo } from "../TestingInfo/TestingInfo";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

import { Logo } from "./Logo";

interface HeaderProps {
  onConnect: () => void;
  address: string;
  balanceSat: number;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onConnect,
  address,
  balanceSat,
  onDisconnect,
}) => {
  return (
    <nav>
      <div className="bg-base-300 shadow-sm">
        <div className="container mx-auto flex w-full items-center justify-between gap-4 p-6 pb-4 md:pb-6">
          <Logo />
          <div className="flex flex-1">
            <div className="hidden flex-1 xl:flex">
              <TestingInfo />
            </div>
          </div>
          <ConnectSmall
            onConnect={onConnect}
            address={address}
            balanceSat={balanceSat}
            onDisconnect={onDisconnect}
          />
          <ThemeToggle />
        </div>
        <div
          className={`container mx-auto flex w-full items-center gap-4 ${address ? "justify-end p-6 pt-0" : ""} md:hidden md:p-0`}
        >
          <ConnectedSmall
            address={address}
            balanceSat={balanceSat}
            onDisconnect={onDisconnect}
          />
        </div>
      </div>
      <div className="container mx-auto flex w-full items-center p-6 pb-0 xl:hidden">
        <TestingInfo />
      </div>
    </nav>
  );
};

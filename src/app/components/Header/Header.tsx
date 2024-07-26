import { ConnectSmall } from "../Connect/ConnectSmall";
import { ConnectedSmall } from "../Connect/ConnectedSmall";
import { TestingInfo } from "../TestingInfo/TestingInfo";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

import { Logo } from "./Logo";

interface HeaderProps {
  onConnect: () => void;
  address: string;
  btcWalletBalanceSat?: number;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onConnect,
  address,
  btcWalletBalanceSat,
  onDisconnect,
}) => {
  return (
    <nav>
      <div className="bg-base-300 shadow-sm">
        <div className="container mx-auto flex-col">
          <div className="w-full flex items-center justify-between gap-4 p-6 pb-4 md:pb-6">
            <Logo />
            <div className="flex flex-1">
              <div className="hidden flex-1 xl:flex">
                <TestingInfo />
              </div>
            </div>
            <ConnectSmall
              onConnect={onConnect}
              address={address}
              btcWalletBalanceSat={btcWalletBalanceSat}
              onDisconnect={onDisconnect}
            />
            <ThemeToggle />
          </div>
          <div
            className={`${address && "justify-end p-6 pt-0"} container mx-auto flex w-full items-center gap-4 md:hidden md:p-0`}
          >
            <ConnectedSmall
              address={address}
              btcWalletBalanceSat={btcWalletBalanceSat}
              onDisconnect={onDisconnect}
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto flex w-full items-center p-6 pb-0 xl:hidden">
        <TestingInfo />
      </div>
    </nav>
  );
};

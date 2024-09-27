import { useWallet } from "@/app/context/wallet/WalletProvider";
import { shouldDisplayTestingMsg } from "@/config";

import { ConnectSmall } from "../Connect/ConnectSmall";
import { ConnectedSmall } from "../Connect/ConnectedSmall";
import { Logo } from "../Logo/Logo";
import { TestingInfo } from "../TestingInfo/TestingInfo";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

interface HeaderProps {
  loading?: boolean;
  btcWalletBalanceSat?: number;
}

export const Header: React.FC<HeaderProps> = ({
  loading,
  btcWalletBalanceSat,
}) => {
  const { address, open, disconnect } = useWallet();

  return (
    <nav>
      <div className="bg-base-300 shadow-sm">
        <div className="container mx-auto flex w-full items-center justify-between gap-4 p-6 pb-4 md:pb-6">
          <Logo />
          <div className="flex flex-1">
            {shouldDisplayTestingMsg() && (
              <div className="hidden flex-1 xl:flex">
                <TestingInfo />
              </div>
            )}
          </div>
          <ConnectSmall
            loading={loading}
            onConnect={open}
            address={address}
            btcWalletBalanceSat={btcWalletBalanceSat}
            onDisconnect={disconnect}
          />
          <ThemeToggle />
        </div>
        <div
          className={`${address && "justify-end p-6 pt-0"}container mx-auto flex w-full items-center gap-4 md:hidden md:p-0`}
        >
          <ConnectedSmall
            loading={loading}
            address={address}
            btcWalletBalanceSat={btcWalletBalanceSat}
            onDisconnect={disconnect}
          />
        </div>
      </div>
      {shouldDisplayTestingMsg() && (
        <div className="container mx-auto flex w-full items-center p-6 pb-0 xl:hidden">
          <TestingInfo />
        </div>
      )}
    </nav>
  );
};

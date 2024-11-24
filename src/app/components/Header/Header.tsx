import { twJoin } from "tailwind-merge";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useWalletConnection } from "@/app/context/wallet/WalletConnectionProvider";
import { useAppState } from "@/app/state";
import { shouldDisplayTestingMsg } from "@/config";

import { ConnectedSmall } from "../Connect/ConnectedSmall";
import { ConnectSmall } from "../Connect/ConnectSmall";
import { Logo } from "../Logo/Logo";
import { TestingInfo } from "../TestingInfo/TestingInfo";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

export const Header = () => {
  const { disconnect, open } = useWalletConnection();
  const { address } = useBTCWallet();
  const { totalBalance, isLoading: loading } = useAppState();

  return (
    <nav>
      <section className="bg-primary-main h-[300px] -mb-[188px]">
        <div className="container h-20 py-6 px-6 mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex flex-1">
            {shouldDisplayTestingMsg() && (
              <div className="hidden flex-1 xl:flex">
                <TestingInfo />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <ConnectSmall
              loading={loading}
              onConnect={open}
              address={address}
              btcWalletBalanceSat={totalBalance}
              onDisconnect={disconnect}
            />
            <ThemeToggle />
          </div>
          <div
            className={twJoin(
              address && "justify-end p-6 pt-0",
              "container mx-auto flex w-full items-center gap-4 md:hidden md:p-0",
            )}
          >
            <ConnectedSmall
              loading={loading}
              address={address}
              btcWalletBalanceSat={totalBalance}
              onDisconnect={disconnect}
            />
          </div>
        </div>
      </section>

      {shouldDisplayTestingMsg() && (
        <div className="container mx-auto flex w-full items-center p-6 pb-0 xl:hidden">
          <TestingInfo />
        </div>
      )}
    </nav>
  );
};

import { useWalletConnect } from "@babylonlabs-io/bbn-wallet-connect";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useAppState } from "@/app/state";
import { shouldDisplayTestingMsg } from "@/config";

import { ConnectSmall } from "../Connect/ConnectSmall";
import { Logo } from "../Logo/Logo";
import { TestingInfo } from "../TestingInfo/TestingInfo";

export const Header = () => {
  const { connected, disconnect, open } = useWalletConnect();
  const { address } = useBTCWallet();
  const { totalBalance, isLoading: loading } = useAppState();

  return (
    <nav>
      <section className="bg-primary-main h-[300px] -mb-[250px] md:-mb-[188px]">
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
              connected={connected}
              loading={loading}
              onConnect={open}
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

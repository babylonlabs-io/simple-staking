import { useWalletConnect } from "@babylonlabs-io/bbn-wallet-connect";

import { useAppState } from "@/app/state";
import { shouldDisplayTestingMsg } from "@/config";

import { Logo } from "../Logo/Logo";
import { TestingInfo } from "../TestingInfo/TestingInfo";
import { Connect } from "../Wallet/Connect";

export const Header = () => {
  const { open } = useWalletConnect();
  const { isLoading: loading } = useAppState();

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
            <Connect loading={loading} onConnect={open} />
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

"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import { useEffect } from "react";

import { GoogleLoginRequired } from "./components/Auth/GoogleLoginRequired";
import { Container } from "./components/Container/Container";
import { CryptoBanner } from "./components/CryptoBanner/CryptoBanner";
import { Header } from "./components/Header/Header";
import { Phase2HereModal } from "./components/Modals/Phase2Here";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { PersonalBalanceStaked } from "./components/PersonalBalance/PersonalBalanceStaked";
import { WalletNotConnected } from "./components/Staking/Form/States/WalletNotConnected";
import { StakingTabs } from "./components/Tabs/StakingTabs";
import { useAuth } from "./contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();
  const { connected } = useWalletConnect();
  useEffect(() => {
    initBTCCurve();
  }, []);

  return (
    <>
      {/* <Banner /> */}
      <Header />
      <CryptoBanner />

      <Container
        as="main"
        // className="-mt-[10rem] md:-mt-[6.5rem] flex flex-col gap-12 md:gap-16 pb-16"
        className="flex flex-col gap-12 md:gap-16 pb-6 pt-6 flex-1 justify-center"
      >
        {user ? (
          <>
            {connected ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PersonalBalance />
                  <PersonalBalanceStaked />
                </div>
                <div className="flex-1">
                  <StakingTabs />
                </div>
              </>
            ) : (
              <div className="hidden md:flex flex-1 justify-center items-center flex-col">
                <div
                  className="px-[404px] py-[100px]"
                  style={{
                    borderLeft: "1px solid",
                    borderRight: "1px solid",
                    borderImage:
                      "linear-gradient(to bottom, hsla(60, 14%, 1%, 1), hsla(42, 22%, 44%, 1), hsla(30, 20%, 2%, 1)) 1",
                  }}
                >
                  <WalletNotConnected />
                </div>
                <div className="gap-20 flex flex-col items-start">
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-white text-sm font-medium">
                      DSRV is an integrated blockchain solutions company with
                      the mission of enriching the crypto ecosystem via stronger
                      connectivity. We strive to be your gateway to a suite of
                      all-comprehensive blockchain services. Everything
                      distributed, served complete.
                    </span>
                    <span className="text-white text-sm font-medium">
                      DSRV is an integrated blockchain solutions company with
                      the mission of enriching the crypto ecosystem via stronger
                      connectivity. We strive to be your gateway to a suite of
                      all-comprehensive blockchain services. Everything
                      distributed, served complete.
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-white text-2xl font-medium">
                      {`What's`}
                    </span>
                    {/* divider */}
                    <div className="h-px w-full bg-secondary-strokeLight" />
                    <div className="grid grid-cols-2 gap-4">
                      <span className="text-white text-sm font-medium">
                        DSRV is an integrated blockchain solutions company with
                        the mission of enriching the crypto ecosystem via
                        stronger connectivity. We strive to be your gateway to a
                        suite of all-comprehensive blockchain services.
                        Everything distributed, served complete.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* <FAQ /> */}
            {/* <Stats /> */}
          </>
        ) : (
          <GoogleLoginRequired />
        )}
      </Container>

      {/* <Footer /> */}
      <Phase2HereModal />
    </>
  );
};

export default Home;

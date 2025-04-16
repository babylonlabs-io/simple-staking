"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useEffect } from "react";
import { useWalletConnect } from "@babylonlabs-io/wallet-connector";

import { GoogleLoginRequired } from "./components/Auth/GoogleLoginRequired";
import { Container } from "./components/Container/Container";
import { CryptoBanner } from "./components/CryptoBanner/CryptoBanner";
import { Header } from "./components/Header/Header";
import { Phase2HereModal } from "./components/Modals/Phase2Here";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { PersonalBalanceStaked } from "./components/PersonalBalance/PersonalBalanceStaked";
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
        className="flex flex-row gap-12 md:gap-16 pb-6 pt-6 flex-1"
      >
        {user ? (
          <>
            {connected && (
              <div className="min-w-[250px] flex flex-col gap-6">
                <PersonalBalance />
                <PersonalBalanceStaked />
              </div>
            )}
            <div className="flex-1">
              <StakingTabs />
            </div>
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

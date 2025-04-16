"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useEffect } from "react";

import { Container } from "./components/Container/Container";
import { CryptoBanner } from "./components/CryptoBanner/CryptoBanner";
import { Header } from "./components/Header/Header";
import { Phase2HereModal } from "./components/Modals/Phase2Here";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { PersonalBalanceStaked } from "./components/PersonalBalance/PersonalBalanceStaked";
import { StakingTabs } from "./components/Tabs/StakingTabs";

const Home = () => {
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
        className="flex flex-col gap-12 md:gap-16 pb-16 pt-16"
      >
        {/* <Stats /> */}
        <div className="flex flex-col gap-6 lg:flex-row flex-1">
          <StakingTabs />
          <div className=" min-w-0 flex flex-col">
            <PersonalBalance />
            <PersonalBalanceStaked />
          </div>
        </div>
        {/* <FAQ /> */}
      </Container>

      {/* <Footer /> */}
      <Phase2HereModal />
    </>
  );
};

export default Home;

"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useEffect } from "react";

import { StakingForm } from "@/app/components/Staking/StakingForm";

import { Container } from "./components/Container/Container";
import { Activity } from "./components/Delegations/Activity";
import { Header } from "./components/Header/Header";
import { Phase2HereModal } from "./components/Modals/Phase2Here";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { Stats } from "./components/Stats/Stats";

const Home = () => {
  useEffect(() => {
    initBTCCurve();
  }, []);

  return (
    <>
      {/* <Banner /> */}
      <Header />

      <Container
        as="main"
        className="-mt-[10rem] md:-mt-[6.5rem] flex flex-col gap-12 md:gap-16 pb-16"
      >
        <Stats />
        <PersonalBalance />
        <StakingForm />
        <Activity />
        {/* <FAQ /> */}
      </Container>

      {/* <Footer /> */}
      <Phase2HereModal />
    </>
  );
};

export default Home;

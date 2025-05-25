"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useEffect, useState } from "react";

import { StakingForm } from "@/app/components/Staking/StakingForm";
import { MultistakingForm } from "@/app/components/Multistaking/MultistakingForm/MultistakingForm";

import { Banner } from "./components/Banner/Banner";
import { Container } from "./components/Container/Container";
import { Activity } from "./components/Delegations/Activity";
import { FAQ } from "./components/FAQ/FAQ";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { Stats } from "./components/Stats/Stats";

const Home = () => {
  const [showMultistaking, setShowMultistaking] = useState(true);

  useEffect(() => {
    initBTCCurve();
    // setShowMultistaking(true);
  }, []);

  return (
    <>
      <Banner />
      <Header />

      <Container
        as="main"
        className="-mt-[10rem] md:-mt-[6.5rem] flex flex-col gap-12 md:gap-16 pb-16"
      >
        <Stats />
        <PersonalBalance />
        {showMultistaking ? <MultistakingForm /> : <StakingForm />}
        <Activity />
        <FAQ />
      </Container>

      <Footer />
    </>
  );
};

export default Home;

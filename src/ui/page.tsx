import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useEffect } from "react";

import { StakingForm } from "@/ui/components/Staking/StakingForm";
import FeatureFlagService from "@/ui/utils/FeatureFlagService";

import { Banner } from "./components/Banner/Banner";
import { Container } from "./components/Container/Container";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { MultistakingFormWrapper } from "./components/Multistaking/MultistakingForm/MultistakingFormWrapper";
import { Stats } from "./components/Stats/Stats";

const Home = () => {
  useEffect(() => {
    initBTCCurve();
  }, []);

  return (
    <>
      <Banner />
      <Header />

      <Container
        as="main"
        className="-mt-[10rem] md:-mt-[6.5rem] flex flex-col gap-12 md:gap-16 pb-16 max-w-[760px] mx-auto"
      >
        <Stats />
        {FeatureFlagService.IsMultiStakingEnabled ? (
          <MultistakingFormWrapper />
        ) : (
          <StakingForm />
        )}
      </Container>

      <Footer />
    </>
  );
};

export default Home;

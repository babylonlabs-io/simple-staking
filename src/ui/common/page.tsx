import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useEffect } from "react";

import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";

import { Container } from "./components/Container/Container";
import { Activity } from "./components/Delegations/Activity";
import { FAQ } from "./components/FAQ/FAQ";
import { MultistakingFormWrapper } from "./components/Multistaking/MultistakingForm/MultistakingFormWrapper";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { StakingForm } from "./components/Staking/StakingForm";
import { Stats } from "./components/Stats/Stats";
import Layout from "./layout";

const Home = () => {
  useEffect(() => {
    initBTCCurve();
  }, []);

  return (
    <Layout>
      <Container
        as="main"
        className="-mt-[10rem] md:-mt-[6.5rem] flex flex-col gap-12 md:gap-16 pb-16"
      >
        <Stats />
        <PersonalBalance />
        {FeatureFlagService.IsMultiStakingEnabled ? (
          <MultistakingFormWrapper />
        ) : (
          <StakingForm />
        )}
        <Activity />
        <FAQ />
      </Container>
    </Layout>
  );
};

export default Home;

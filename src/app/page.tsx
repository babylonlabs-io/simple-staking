"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useEffect, useState } from "react";

import { StakingForm } from "@/app/components/Staking/StakingForm";

import { Banner } from "./components/Banner/Banner";
import { Activity } from "./components/Delegations/Activity";
import { FAQ } from "./components/FAQ/FAQ";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { Phase2HereModal } from "./components/Modals/Phase2Here";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { Stats } from "./components/Stats/Stats";

const Home = () => {
  useEffect(() => {
    initBTCCurve();
  }, []);

  const [showPhase2HereModal, setShowPhase2HereModal] = useState(true);

  return (
    <>
      <Banner />
      <Header />
      <div className="container mx-auto flex justify-center p-6">
        <div className="container flex flex-col gap-6">
          <Stats />
          <PersonalBalance />
          <StakingForm />
          <Activity />
        </div>
      </div>
      <FAQ />
      <Footer />
      <Phase2HereModal
        open={showPhase2HereModal}
        onClose={() => setShowPhase2HereModal(false)}
      />
    </>
  );
};

export default Home;

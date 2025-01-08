"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useEffect, useState } from "react";

import { Banner } from "./components/Banner/Banner";
import { Activity } from "./components/Delegations/Activity";
import { FAQ } from "./components/FAQ/FAQ";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { Phase2HereModal } from "./components/Modals/Phase2Here";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { Staking } from "./components/Staking/Staking";
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
      <div className="container mx-auto flex justify-center py-6 px-4 md:px-6">
        <div className="container flex flex-col gap-6">
          <Stats />
          <PersonalBalance />
          <Staking />
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

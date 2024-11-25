"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useEffect } from "react";

import { DelegationList } from "@/components/delegations/DelegationList";

import { DelegationTabs } from "./components/Delegations/DelegationTabs";
import { FAQ } from "./components/FAQ/FAQ";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { FilterOrdinalsModal } from "./components/Modals/FilterOrdinalsModal";
import { NetworkBadge } from "./components/NetworkBadge/NetworkBadge";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { Staking } from "./components/Staking/Staking";
import { Stats } from "./components/Stats/Stats";

const Home = () => {
  useEffect(() => {
    initBTCCurve();
  }, []);

  return (
    <>
      <NetworkBadge />
      <Header />
      <div className="container mx-auto flex justify-center p-6">
        <div className="container flex flex-col gap-6">
          <Stats />
          <PersonalBalance />
          <Staking />
          <DelegationTabs />
          <DelegationList />
        </div>
      </div>
      <FAQ />
      <Footer />
      <FilterOrdinalsModal />
    </>
  );
};

export default Home;

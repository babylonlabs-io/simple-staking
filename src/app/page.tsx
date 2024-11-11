"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useEffect, useState } from "react";

import { DelegationTabs } from "./components/Delegations/DelegationTabs";
import { FAQ } from "./components/FAQ/FAQ";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { FilterOrdinalsModal } from "./components/Modals/FilterOrdinalsModal";
import { PendingVerificationModal } from "./components/Modals/PendingVerificationModal";
import { NetworkBadge } from "./components/NetworkBadge/NetworkBadge";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { Staking } from "./components/Staking/Staking";
import { Stats } from "./components/Stats/Stats";

const Home = () => {
  useEffect(() => {
    initBTCCurve();
  }, []);

  // TODO remove
  const [pendingVerificationOpen, setPendingVerificationOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const [awaitingWalletResponse, setAwaitingWalletResponse] = useState(false);
  const handlePendingOpen = async () => {
    // open the modal
    setPendingVerificationOpen(true);
    await new Promise((resolve) => setTimeout(resolve, 3000)); // simulate waiting for BBN verification
    setVerified(true);
  };
  const handlePendingClose = () => {
    // clean out the state
    setVerified(false);
    setAwaitingWalletResponse(false);
    setPendingVerificationOpen(false);
  };
  const handleStakeSignBroadcast = async () => {
    console.log("start staking");
    setAwaitingWalletResponse(true); // waiting for wallet response
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setAwaitingWalletResponse(false);
    console.log("staking done");
    handlePendingClose();
  };

  return (
    <>
      <button onClick={handlePendingOpen}>Pending</button>
      <NetworkBadge />
      <Header />
      <div className="container mx-auto flex justify-center p-6">
        <div className="container flex flex-col gap-6">
          <Stats />
          <PersonalBalance />
          <Staking />
          <DelegationTabs />
        </div>
      </div>
      <FAQ />
      <Footer />
      <FilterOrdinalsModal />
      <PendingVerificationModal
        open={pendingVerificationOpen}
        onClose={handlePendingClose}
        verified={verified}
        onStake={handleStakeSignBroadcast}
        awaitingWalletResponse={awaitingWalletResponse}
      />
    </>
  );
};

export default Home;

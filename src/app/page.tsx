"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useEffect, useState } from "react";

import { StakingForm } from "@/app/components/Staking/StakingForm";

import { Banner } from "./components/Banner/Banner";
import { Container } from "./components/Container/Container";
import { Activity } from "./components/Delegations/Activity";
import { FAQ } from "./components/FAQ/FAQ";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { Phase2HereModal } from "./components/Modals/Phase2Here";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { Stats } from "./components/Stats/Stats";
import { useBTCWallet } from "./context/wallet/BTCWalletProvider";

const Home = () => {
  useEffect(() => {
    initBTCCurve();
  }, []);

  const [showPhase2HereModal, setShowPhase2HereModal] = useState(true);

  const { signPsbt } = useBTCWallet();

  const handleSign = async () => {
    const psbtNested =
      "70736274ff01007e0200000001318ea5736b05051f6c232f162f2c99596c1eec377d99ae55768e953b4327d1020000000000ffffffff0250c30000000000002251208eda6a906b1f239306868c8e7c1340659e1bde6ce77efbbca7de19c59dc66b251e740e000000000017a91468438a682dd7a24db99de494dcac5021fbe18ee287000000000001012040420f000000000017a91468438a682dd7a24db99de494dcac5021fbe18ee287000000";
    const psbtLegacy =
      "70736274ff0100800200000001a1d928d13ef4c5e29b7050d0759876c90052f9f61680d82003be0cbea207f83e0000000000ffffffff0250c3000000000000225120274c2073379f4837f2e5dee5476f237123577db11a6f4db7445ca30a88d4add91e740e00000000001976a9148acb842055bd99cb1f36e0cdbd4517a2695650e588ac000000000001012240420f00000000001976a9148acb842055bd99cb1f36e0cdbd4517a2695650e588ac000000";
    let signed;
    try {
      signed = await signPsbt(psbtNested);
    } catch (error) {
      console.log(error);
    }
    console.log(signed);
  };

  return (
    <>
      <Banner />
      <Header />

      <Container
        as="main"
        className="-mt-[10rem] md:-mt-[6.5rem] flex flex-col gap-12 md:gap-16 pb-16"
      >
        <button onClick={handleSign}>sign</button>
        <Stats />
        <PersonalBalance />
        <StakingForm />
        <Activity />
        <FAQ />
      </Container>

      <Footer />
      <Phase2HereModal
        open={showPhase2HereModal}
        onClose={() => setShowPhase2HereModal(false)}
      />
    </>
  );
};

export default Home;

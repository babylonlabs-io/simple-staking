"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useEffect } from "react";
import { twJoin } from "tailwind-merge";

import { network } from "@/config/network.config";
import { Network } from "@/utils/wallet/wallet_provider";

import { Delegations } from "./components/Delegations/Delegations";
import { FAQ } from "./components/FAQ/FAQ";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { NetworkBadge } from "./components/NetworkBadge/NetworkBadge";
import { Staking } from "./components/Staking/Staking";
import { Stats } from "./components/Stats/Stats";
import { Summary } from "./components/Summary/Summary";

const Home = () => {
  useEffect(() => {
    initBTCCurve();
  }, []);

  return (
    <main
      className={twJoin(
        `relative h-full min-h-svh w-full`,
        network === Network.MAINNET ? "main-app-mainnet" : "main-app-testnet",
      )}
    >
      <NetworkBadge />
      <Header />
      <div className="container mx-auto flex justify-center p-6">
        <div className="container flex flex-col gap-6">
          <Stats />
          <Summary />
          <Staking />
          <Delegations />
        </div>
      </div>
      <FAQ />
      <Footer />
    </main>
  );
};

export default Home;

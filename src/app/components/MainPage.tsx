"use client";

import { Network } from "@babylonlabs-io/wallet-connector";
import { usePrivy } from "@privy-io/react-auth";
import { twJoin } from "tailwind-merge";

import { network } from "@/config/network/btc";

import { useAuth } from "../contexts/AuthContext";

import { CryptoBanner } from "./CryptoBanner/CryptoBanner";
import { Footer } from "./Footer/Footer";
import { Header } from "./Header/Header";
import { LoginScreen } from "./Login/LoginScreen";

export default function MainPage({ children }: { children: React.ReactNode }) {
  const { ready } = usePrivy();
  const { user } = useAuth();

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-10 h-10 bg-white rounded-full animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div
      className={twJoin(
        `relative h-full min-h-svh w-full`,
        network === Network.MAINNET ? "main-app-mainnet" : "main-app-testnet",
        // "bg-primary-contrast",
        "main-bg-grdient",
      )}
    >
      {user && <Header />}
      {user && <CryptoBanner />}
      {children}
      <Footer />
    </div>
  );
}

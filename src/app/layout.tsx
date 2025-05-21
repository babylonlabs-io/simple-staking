import { twJoin } from "tailwind-merge";

import { Network } from "@/app/types/network";
import { network } from "@/config/network/btc";

import "./globals.css";
import Providers from "./providers";

// TODO: find alternative solution for vite
export const metadata = {
  title: "Babylon - Staking Dashboard",
  description: "BTC Staking Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div
        className={twJoin(
          `relative h-full min-h-svh w-full`,
          network === Network.MAINNET ? "main-app-mainnet" : "main-app-testnet",
          "bg-primary-contrast",
        )}
      >
        {children}
      </div>
    </Providers>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { twJoin } from "tailwind-merge";

import { network } from "@/config/network.config";
import { Network } from "@/utils/wallet/btc_wallet_provider";

import MetaTags from "./components/Meta/MetaTags";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Babylon - Staking Dashboard",
  description: "BTC Staking Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <MetaTags />
      </head>
      <body className={inter.className}>
        <Providers>
          <main
            className={twJoin(
              `relative h-full min-h-svh w-full`,
              network === Network.MAINNET
                ? "main-app-mainnet"
                : "main-app-testnet",
              "bg-primary-contrast dark:bg-[#1E1E1E]",
            )}
          >
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

"use client";

import { Inter } from "next/font/google";
import { twJoin } from "tailwind-merge";

import { network } from "@/config/network.config";
import { Network } from "@/utils/wallet/wallet_provider";

import GenericError from "./components/Error/GenericError";
import MetaTags from "./components/Meta/MetaTags";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function GlobalError() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <MetaTags />
      </head>
      <body className={inter.className}>
        <main
          className={twJoin(
            `relative h-full min-h-svh w-full`,
            network === Network.MAINNET
              ? "main-app-mainnet"
              : "main-app-testnet",
          )}
        >
          <GenericError />
        </main>
      </body>
    </html>
  );
}

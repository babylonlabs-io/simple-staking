"use client";

import * as Sentry from "@sentry/nextjs";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import { twJoin } from "tailwind-merge";

import { network } from "@/config/network.config";
import { Network } from "@/utils/wallet/btc_wallet_provider";

import GenericError from "./components/Error/GenericError";
import MetaTags from "./components/Meta/MetaTags";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

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

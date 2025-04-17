import type { Metadata } from "next";
import { twJoin } from "tailwind-merge";

import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { Network } from "@/app/types/network";
import { network } from "@/config/network/btc";

import MetaTags from "./components/Meta/MetaTags";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "DSRV - Staking Dashboard",
  description: "Staking Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <MetaTags />
      </head>
      <body className="font-sans">
        <Providers>
          <LanguageProvider>
            <div
              className={twJoin(
                `relative h-full min-h-svh w-full`,
                network === Network.MAINNET
                  ? "main-app-mainnet"
                  : "main-app-testnet",
                // "bg-primary-contrast",
                "main-bg-grdient",
              )}
            >
              {children}
            </div>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}

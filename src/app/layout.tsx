import type { Metadata } from "next";
import { Noto_Sans_Mono } from "next/font/google";
import { twJoin } from "tailwind-merge";

import { Network } from "@/app/types/network";
import { network } from "@/config/network/btc";

import MetaTags from "./components/Meta/MetaTags";
import "./globals.scss";
import Providers from "./providers";

const notoSansMono = Noto_Sans_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "stakefish - Staking Dashboard",
  description: "BTC Staking Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${notoSansMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Inter font */}
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <MetaTags />
      </head>
      <body>
        <Providers>
          <div
            className={twJoin(
              `relative h-full min-h-svh w-full`,
              network === Network.MAINNET
                ? "main-app-mainnet"
                : "main-app-testnet",
            )}
          >
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

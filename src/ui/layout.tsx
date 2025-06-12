import { twJoin } from "tailwind-merge";

import { network } from "@/ui/config/network/btc";
import { Network } from "@/ui/types/network";

import "./globals.css";
import Providers from "./providers";

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

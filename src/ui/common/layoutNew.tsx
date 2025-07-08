import { twJoin } from "tailwind-merge";

import { network } from "@/ui/common/config/network/btc";
import { Network } from "@/ui/common/types/network";

import "@/ui/globals.css";
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
        )}
      >
        {children}
      </div>
    </Providers>
  );
}

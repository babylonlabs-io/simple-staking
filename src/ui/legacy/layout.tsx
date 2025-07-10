import { twJoin } from "tailwind-merge";

import { network } from "@/ui/legacy/config/network/btc";
import { Network } from "@/ui/legacy/types/network";

import { Banner } from "./components/Banner/Banner";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children?: React.ReactNode;
}>) {
  return (
    <div
      className={twJoin(
        `relative h-full min-h-svh w-full`,
        network === Network.MAINNET ? "main-app-mainnet" : "main-app-testnet",
        "bg-primary-contrast",
      )}
    >
      <Banner />
      <Header />
      {children}

      <Footer />
    </div>
  );
}

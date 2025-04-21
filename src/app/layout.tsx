import type { Metadata } from "next";

import { LanguageProvider } from "@/app/contexts/LanguageContext";

import MainPage from "./components/MainPage";
import MetaTags from "./components/Meta/MetaTags";
import PrivyProviders from "./contexts/PrivyProvider";
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
          <PrivyProviders>
            <LanguageProvider>
              <MainPage>{children}</MainPage>
            </LanguageProvider>
          </PrivyProviders>
        </Providers>
      </body>
    </html>
  );
}

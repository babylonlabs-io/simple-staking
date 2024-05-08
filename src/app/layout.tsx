import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "react-responsive-modal/styles.css";
import "react-tooltip/dist/react-tooltip.css";

import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Babylon - Simple Staking",
  description: "Simple Staking for BTC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

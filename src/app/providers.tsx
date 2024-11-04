"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { ThemeProvider } from "next-themes";
import React from "react";

import { NotificationContainer } from "./components/Notification/NotificationContainer";
import { ErrorProvider } from "./context/Error/ErrorContext";
import { StakingStatsProvider } from "./context/api/StakingStatsProvider";
import { BTCWalletProvider } from "./context/wallet/BTCWalletProvider";
import { CosmosWalletProvider } from "./context/wallet/CosmosWalletProvider";
import { WalletConnectionProvider } from "./context/wallet/WalletConnectionProvider";
import { AppState } from "./state";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = React.useState(new QueryClient());

  return (
    <ThemeProvider defaultTheme="dark" attribute="data-theme">
      <QueryClientProvider client={client}>
        <ErrorProvider>
          <WalletConnectionProvider>
            <BTCWalletProvider>
              <CosmosWalletProvider>
                <AppState>
                  <StakingStatsProvider>
                    <ReactQueryStreamedHydration>
                      {children}
                    </ReactQueryStreamedHydration>
                  </StakingStatsProvider>
                </AppState>
              </CosmosWalletProvider>
            </BTCWalletProvider>
          </WalletConnectionProvider>
        </ErrorProvider>
        <ReactQueryDevtools
          buttonPosition="bottom-left"
          initialIsOpen={false}
        />
      </QueryClientProvider>
      <NotificationContainer />
    </ThemeProvider>
  );
}

export default Providers;

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { ThemeProvider } from "next-themes";
import React from "react";

import { ErrorProvider } from "./context/Error/ErrorContext";
import { StakingStatsProvider } from "./context/api/StakingStatsProvider";
import { WalletProvider } from "./context/wallet/WalletProvider";
import { AppState } from "./state";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = React.useState(new QueryClient());

  return (
    <ThemeProvider defaultTheme="dark" attribute="data-theme">
      <QueryClientProvider client={client}>
        <ErrorProvider>
          <WalletProvider>
            <AppState>
              <StakingStatsProvider>
                <ReactQueryStreamedHydration>
                  {children}
                </ReactQueryStreamedHydration>
              </StakingStatsProvider>
            </AppState>
          </WalletProvider>
        </ErrorProvider>
        <ReactQueryDevtools
          buttonPosition="bottom-left"
          initialIsOpen={false}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default Providers;

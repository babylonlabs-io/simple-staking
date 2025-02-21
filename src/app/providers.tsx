"use client";

import { ScrollLocker } from "@babylonlabs-io/bbn-core-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { ThemeProvider } from "next-themes";
import React, { Suspense } from "react";

import { NotificationContainer } from "./components/Notification/NotificationContainer";
import { ErrorProvider } from "./context/Error/ErrorProvider";
import { StakingStatsProvider } from "./context/api/StakingStatsProvider";
import { BbnRpcProvider } from "./context/rpc/BbnRpcProvider";
import { BTCWalletProvider } from "./context/wallet/BTCWalletProvider";
import { CosmosWalletProvider } from "./context/wallet/CosmosWalletProvider";
import { WalletConnectionProvider } from "./context/wallet/WalletConnectionProvider";
import { AppState } from "./state";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = React.useState(new QueryClient());

  return (
    <Suspense>
      <ScrollLocker>
        <ThemeProvider
          defaultTheme="light"
          enableSystem={false}
          attribute="data-theme"
        >
          <QueryClientProvider client={client}>
            <ErrorProvider>
              <BbnRpcProvider>
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
              </BbnRpcProvider>
            </ErrorProvider>
            <ReactQueryDevtools
              buttonPosition="bottom-left"
              initialIsOpen={false}
            />
          </QueryClientProvider>
          <NotificationContainer />
        </ThemeProvider>
      </ScrollLocker>
    </Suspense>
  );
}

export default Providers;

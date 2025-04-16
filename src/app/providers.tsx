"use client";

import { ScrollLocker } from "@babylonlabs-io/core-ui";
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
import { AuthProvider } from "./contexts/AuthContext";
import { AppState } from "./state";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = React.useState(new QueryClient());

  return (
    <Suspense>
      <ScrollLocker>
        <ThemeProvider
          defaultTheme="dark"
          enableSystem={false}
          attribute="class"
        >
          <QueryClientProvider client={client}>
            <ErrorProvider>
              <AuthProvider>
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
              </AuthProvider>
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

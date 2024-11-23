"use client";
import { ScrollLocker } from "@babylonlabs-io/bbn-core-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { ThemeProvider } from "next-themes";
import React from "react";

import { NotificationContainer } from "./components/Notification/NotificationContainer";
import { StakingStatsProvider } from "./context/api/StakingStatsProvider";
import { ErrorProvider } from "./context/Error/ErrorContext";
import { WalletConnector } from "./context/wallet/ConnectorProvider";
import { AppState } from "./state";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = React.useState(new QueryClient());

  return (
    <ScrollLocker>
      <ThemeProvider defaultTheme="dark" attribute="data-theme">
        <QueryClientProvider client={client}>
          <ErrorProvider>
            <WalletConnector>
              <AppState>
                <StakingStatsProvider>
                  <ReactQueryStreamedHydration>
                    {children}
                  </ReactQueryStreamedHydration>
                </StakingStatsProvider>
              </AppState>
            </WalletConnector>
          </ErrorProvider>

          <ReactQueryDevtools
            buttonPosition="bottom-left"
            initialIsOpen={false}
          />
        </QueryClientProvider>
        <NotificationContainer />
      </ThemeProvider>
    </ScrollLocker>
  );
}

export default Providers;

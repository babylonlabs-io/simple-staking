"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { ThemeProvider } from "next-themes";
import React from "react";

import { ErrorProvider } from "./context/Error/ErrorContext";
import { TermsProvider } from "./context/Terms/TermsContext";
import { GlobalParamsProvider } from "./context/api/GlobalParamsProvider";
import { StakingStatsProvider } from "./context/api/StakingStatsProvider";
import { BtcHeightProvider } from "./context/mempool/BtcHeightProvider";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = React.useState(new QueryClient());

  return (
    <ThemeProvider defaultTheme="dark" attribute="data-theme">
      <QueryClientProvider client={client}>
        <TermsProvider>
          <ErrorProvider>
            <GlobalParamsProvider>
              <BtcHeightProvider>
                <StakingStatsProvider>
                  <ReactQueryStreamedHydration>
                    {children}
                  </ReactQueryStreamedHydration>
                </StakingStatsProvider>
              </BtcHeightProvider>
            </GlobalParamsProvider>
          </ErrorProvider>
        </TermsProvider>
        <ReactQueryDevtools
          buttonPosition="bottom-left"
          initialIsOpen={false}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default Providers;

"use client";

import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { ThemeProvider } from "next-themes";

import { ErrorProvider } from "./context/error/ErrorContext";
import { BtcHeightProvider } from "./context/mempool/BtcHeightProvider";
import { GlobalParamsProvider } from "./context/api/GlobalParamsProvider";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = React.useState(new QueryClient());

  return (
    <ThemeProvider defaultTheme="dark" attribute="data-theme">
      <QueryClientProvider client={client}>
        <ErrorProvider>
          <GlobalParamsProvider>
            <BtcHeightProvider>
              <ReactQueryStreamedHydration>
                {children}
              </ReactQueryStreamedHydration>
            </BtcHeightProvider>
          </GlobalParamsProvider>
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

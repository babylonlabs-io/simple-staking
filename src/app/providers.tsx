"use client";

import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { ThemeProvider } from "next-themes";
import { ErrorProvider } from "./context/Error/ErrorContext";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = React.useState(new QueryClient());

  return (
    <ThemeProvider defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={client}>
        <ErrorProvider>
          <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
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

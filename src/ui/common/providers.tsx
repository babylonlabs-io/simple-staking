import { CoreUIProvider, ScrollLocker } from "@babylonlabs-io/core-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Suspense, useEffect, useRef, useState } from "react";

import { NotificationContainer } from "./components/Notification/NotificationContainer";
import { ErrorProvider } from "./context/Error/ErrorProvider";
import { BbnRpcProvider } from "./context/rpc/BbnRpcProvider";
import { BTCWalletProvider } from "./context/wallet/BTCWalletProvider";
import { CosmosWalletProvider } from "./context/wallet/CosmosWalletProvider";
import { WalletConnectionProvider } from "./context/wallet/WalletConnectionProvider";
import { AppState } from "./state";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = useState(new QueryClient());
  const appRootRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    if (appRootRef.current) {
      setPortalContainer(appRootRef.current);
    }
  }, []);

  return (
    <Suspense>
      <ScrollLocker>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CoreUIProvider portalContainer={portalContainer}>
            <div ref={appRootRef} className="min-h-screen">
              <QueryClientProvider client={client}>
                <ErrorProvider>
                  <BbnRpcProvider>
                    <WalletConnectionProvider>
                      <BTCWalletProvider>
                        <CosmosWalletProvider>
                          <AppState>{children}</AppState>
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
            </div>
          </CoreUIProvider>
        </ThemeProvider>
      </ScrollLocker>
    </Suspense>
  );
}

export default Providers;

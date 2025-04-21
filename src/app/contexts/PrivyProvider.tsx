"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function PrivyProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId="cm54xyntl099beb5gupzfpg1f"
      clientId="client-WY5fBnDo7ciKmRSnkHvbnjSGhNUZo3QhzEzfXkiWNeoNy"
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}

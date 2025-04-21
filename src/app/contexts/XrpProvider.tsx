"use client";

import { usePrivy, useSignMessage } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useState } from "react";

import { generatePrivateKeysFromEthereumSignature } from "@/utils/chain-keys/createKeys";

const XrpContext = createContext<{ user: any; xrpAddress: string | null }>({
  user: null,
  xrpAddress: null,
});

export default function XrpProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authenticated, ready } = usePrivy();
  const { signMessage } = useSignMessage();
  const [xrpAddress, setXrpAddress] = useState<string | null>(null);

  useEffect(() => {
    console.log("authenticated", authenticated);
    if (!user || !ready || !authenticated) return;
    console.log("user", user);
    const getXrpAddress = async () => {
      try {
        const { signature } = await signMessage(
          {
            message: "Make pk for cosmos and sui",
          },
          // {
          //   uiOptions: { showWalletUIs: false },
          // },
        );
        const { xrpAddress } =
          generatePrivateKeysFromEthereumSignature(signature);
        console.log("xrpAddress", xrpAddress);
        setXrpAddress(xrpAddress);
      } catch (error) {
        console.error("Error getting xrp address", error);
      }
    };
    getXrpAddress();
  }, [user, ready, authenticated]);

  return (
    <XrpContext.Provider value={{ user, xrpAddress }}>
      {children}
    </XrpContext.Provider>
  );
}

export const useXrp = () => {
  return useContext(XrpContext);
};

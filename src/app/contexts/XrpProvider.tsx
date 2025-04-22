"use client";

import { usePrivy, useSignMessage } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useState } from "react";
import { useCallback } from "react";
import { Client, dropsToXrp } from "xrpl";

import { generatePrivateKeysFromEthereumSignature } from "@/utils/chain-keys/createKeys";

import { TransactionHistory } from "../components/XRP/XRPActivityTabs";

const XrpContext = createContext<{
  xrpPublicClient: Client | null;
  xrpBalance: number;
  xrpAddress: string | null;
  getXrpAddress: () => Promise<void>;
  getMnemonic: () => Promise<string | null>;
  historyList: TransactionHistory[];
}>({
  xrpPublicClient: null,
  xrpBalance: 0,
  xrpAddress: null,
  getXrpAddress: async () => {},
  getMnemonic: async () => null,
  historyList: [],
});

export default function XrpProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authenticated, ready } = usePrivy();
  const { signMessage } = useSignMessage();
  const [xrpPublicClient, setXrpPublicClient] = useState<Client | null>(null);
  const [xrpAddress, setXrpAddress] = useState<string | null>(null);
  const [xrpBalance, setXrpBalance] = useState<number>(0);
  const [historyList, setHistoryList] = useState<TransactionHistory[]>([]);
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const getXrpBalance = async () => {
    if (!xrpPublicClient || !xrpAddress) return;
    try {
      const _balance = await xrpPublicClient.getXrpBalance(xrpAddress);
      setXrpBalance(_balance);
    } catch (error) {
      console.error("Error getting xrp balance", error);
      setXrpBalance(0);
    }
  };

  const getXrpAddress = async () => {
    try {
      await sleep(2000);
      const { signature } = await signMessage(
        {
          message: "Make pk for cosmos and sui",
        },
        {
          uiOptions: { showWalletUIs: false },
          address: user?.wallet?.address,
        },
      );
      const { xrpAddress } =
        generatePrivateKeysFromEthereumSignature(signature);
      console.log("xrpAddress", xrpAddress);
      setXrpAddress(xrpAddress);
    } catch (error) {
      console.error("Error getting xrp address", error);
    }
  };

  const getMnemonic = async () => {
    try {
      const { signature } = await signMessage(
        {
          message: "Make pk for cosmos and sui",
        },
        {
          uiOptions: { showWalletUIs: false },
        },
      );
      const { mnemonic } = generatePrivateKeysFromEthereumSignature(signature);
      return mnemonic;
    } catch (error) {
      console.error("Error getting mnemonic", error);
      return null;
    }
  };

  const fetchXrpTxHistory = useCallback(async () => {
    if (!xrpPublicClient || !xrpAddress) return;
    try {
      const rawTxHistory = await xrpPublicClient?.request({
        command: "account_tx",
        account: xrpAddress,
        limit: 10, // 최근 거래 몇 건을 가져올지
        ledger_index_min: -1,
        ledger_index_max: -1,
        binary: false,
        forward: false, // 최신 거래부터 역순으로 조회
      });
      const txHistory: TransactionHistory[] = (
        rawTxHistory?.result.transactions ?? []
      )
        .filter(
          (tx) =>
            tx.tx_json?.Account === xrpAddress &&
            tx.tx_json?.Destination === "rEPQxsSVER2r4HeVR4APrVCB45K68rqgp2",
        )
        .map((tx) => {
          return {
            amount:
              dropsToXrp(
                (tx.tx_json as unknown as { DeliverMax: string })?.DeliverMax,
              ).toString() ?? 0,
            txHash: tx.hash ?? "",
            timeStamp:
              (tx as unknown as { close_time_iso: string }).close_time_iso ??
              "",
          };
        });
      setHistoryList(txHistory);
    } catch (e) {
      console.log("Error while loading more XRP AccountTxHistory", e);
      setHistoryList((prev) => (prev.length > 0 ? prev : []));
    }
  }, [xrpAddress, xrpPublicClient]);

  useEffect(() => {
    getXrpBalance();
    fetchXrpTxHistory();
  }, [xrpPublicClient, xrpAddress]);

  const initClients = async (network: "mainnet" | "testnet") => {
    // Create XRP provider
    try {
      xrpPublicClient?.disconnect();
      const rpcUrl =
        network === "mainnet"
          ? "wss://s1.ripple.com:51234/"
          : "wss://s.altnet.rippletest.net:51233";
      const xrpPublicClientInstance = new Client(rpcUrl);
      await xrpPublicClientInstance.connect();
      setXrpPublicClient(xrpPublicClientInstance);
    } catch (error) {
      console.error("Error initializing xrp public client:", error);
    }
  };

  useEffect(() => {
    if (!user || !ready || !authenticated) return;
    console.log("user", user);
    initClients("mainnet");
    // getXrpAddress();
  }, [user, ready, authenticated]);

  return (
    <XrpContext.Provider
      value={{
        xrpPublicClient,
        xrpBalance,
        xrpAddress,
        getXrpAddress,
        getMnemonic,
        historyList,
      }}
    >
      {children}
    </XrpContext.Provider>
  );
}

export const useXrp = () => {
  return useContext(XrpContext);
};

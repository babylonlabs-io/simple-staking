"use client";

import { usePrivy, useSignMessage } from "@privy-io/react-auth";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Client, dropsToXrp } from "xrpl";

import { generatePrivateKeysFromEthereumSignature } from "@/utils/chain-keys/createKeys";

import { TransactionHistory } from "../components/XRP/XRPActivityTabs";

const XrpContext = createContext<{
  xrpPublicClient: Client | null;
  xrpBalance: number;
  loadingXrpBalance: boolean;
  stakedBalance: number;
  loadingStakedBalance: boolean;
  xrpAddress: string | null;
  getXrpAddress: () => Promise<void>;
  getXrpBalance: () => Promise<void>;
  getMnemonic: () => Promise<string | null>;
  historyList: TransactionHistory[];
  setHistoryList: Dispatch<SetStateAction<TransactionHistory[]>>;
  getStakedInfo: () => Promise<void>;
}>({
  xrpPublicClient: null,
  xrpBalance: 0,
  loadingXrpBalance: false,
  stakedBalance: 0,
  loadingStakedBalance: false,
  xrpAddress: null,
  getXrpAddress: async () => {},
  getXrpBalance: async () => {},
  getMnemonic: async () => null,
  historyList: [],
  setHistoryList: () => {},
  getStakedInfo: async () => {},
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
  const [loadingXrpBalance, setLoadingXrpBalance] = useState<boolean>(false);

  const [historyList, setHistoryList] = useState<TransactionHistory[]>([]);
  const [stakedBalance, setStakedBalance] = useState<number>(0);
  const [loadingStakedBalance, setLoadingStakedBalance] =
    useState<boolean>(false);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const getXrpBalance = async () => {
    if (!xrpPublicClient || !xrpAddress) return;
    try {
      setLoadingXrpBalance(true);
      const _balance = await xrpPublicClient.getXrpBalance(xrpAddress);
      setXrpBalance(_balance);
    } catch (error) {
      console.error("Error getting xrp balance", error);
      setXrpBalance(0);
    } finally {
      setLoadingXrpBalance(false);
    }
  };

  const getXrpAddress = async () => {
    try {
      await sleep(1000);
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

  const getStakedInfo = async () => {
    if (!xrpAddress) return;
    try {
      setLoadingStakedBalance(true);
      const _stakedBalance = await fetch(
        `/api/xrp/staking-info?address=${xrpAddress}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );
      if (!_stakedBalance.ok) {
        console.error(
          "Error fetching staked balance:",
          _stakedBalance.status,
          _stakedBalance.statusText,
        );
        return;
      }
      const [_stakedBalanceJson] = await _stakedBalance.json();
      console.log("stakedBalanceJson", _stakedBalanceJson);
      const depositBalance = _stakedBalanceJson.depositBalance;
      const apr = _stakedBalanceJson.apr;

      console.log("depositBalance", depositBalance);
      setStakedBalance(depositBalance);
    } finally {
      setLoadingStakedBalance(false);
    }
  };

  useEffect(() => {
    getXrpBalance();
    fetchXrpTxHistory();
    getStakedInfo();
    getXrpAddress();
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
  }, [user, ready, authenticated]);

  return (
    <XrpContext.Provider
      value={{
        xrpPublicClient,
        xrpBalance,
        loadingXrpBalance,
        stakedBalance,
        loadingStakedBalance,
        xrpAddress,
        getXrpAddress,
        getXrpBalance,
        getMnemonic,
        historyList,
        setHistoryList,
        getStakedInfo,
      }}
    >
      {children}
    </XrpContext.Provider>
  );
}

export const useXrp = () => {
  return useContext(XrpContext);
};

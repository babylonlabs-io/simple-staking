"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { networks } from "bitcoinjs-lib";
import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { network } from "@/config/network.config";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { calculateDelegationsDiff } from "@/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { filterOrdinals } from "@/utils/utxo";
import { WalletError, WalletErrorType } from "@/utils/wallet/errors";
import {
  getPublicKeyNoCoord,
  isSupportedAddressType,
  toNetwork,
} from "@/utils/wallet/index";
import { Network, WalletProvider } from "@/utils/wallet/wallet_provider";

import { getDelegations, PaginatedDelegations } from "./api/getDelegations";
import { getGlobalParams } from "./api/getGlobalParams";
import { UTXO_KEY } from "./common/constants";
import { signPsbtTransaction } from "./common/utils/psbt";
import { Delegations } from "./components/Delegations/Delegations";
import { FAQ } from "./components/FAQ/FAQ";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { ConnectModal } from "./components/Modals/ConnectModal";
import { ErrorModal } from "./components/Modals/ErrorModal";
import { NetworkBadge } from "./components/NetworkBadge/NetworkBadge";
import { Staking } from "./components/Staking/Staking";
import { Stats } from "./components/Stats/Stats";
import { Summary } from "./components/Summary/Summary";
import { useError } from "./context/Error/ErrorContext";
import { Delegation, DelegationState } from "./types/delegations";
import { ErrorState } from "./types/errors";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [btcWallet, setBTCWallet] = useState<WalletProvider>();
  const [btcWalletNetwork, setBTCWalletNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");

  const [address, setAddress] = useState("");
  const {
    error,
    isErrorOpen,
    showError,
    hideError,
    retryErrorAction,
    noCancel,
    handleError,
    captureError,
  } = useError();
  const {
    data: paramWithContext,
    isLoading: isLoadingCurrentParams,
    error: globalParamsVersionError,
    isError: hasGlobalParamsVersionError,
    refetch: refetchGlobalParamsVersion,
  } = useQuery({
    queryKey: ["global params"],
    queryFn: async () => {
      const [height, versions] = await Promise.all([
        btcWallet!.getBTCTipHeight(),
        getGlobalParams(),
      ]);
      return {
        // The staking parameters are retrieved based on the current height + 1
        // so this verification should take this into account.
        currentHeight: height,
        nextBlockParams: getCurrentGlobalParamsVersion(height + 1, versions),
      };
    },
    refetchInterval: 60000, // 1 minute
    // Should be enabled only when the wallet is connected
    enabled: !!btcWallet,
    retry: (failureCount, error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const {
    data: delegations,
    fetchNextPage: fetchNextDelegationsPage,
    hasNextPage: hasNextDelegationsPage,
    isFetchingNextPage: isFetchingNextDelegationsPage,
    error: delegationsError,
    isError: hasDelegationsError,
    refetch: refetchDelegationData,
  } = useInfiniteQuery({
    queryKey: ["delegations", address, publicKeyNoCoord],
    queryFn: ({ pageParam = "" }) =>
      getDelegations(pageParam, publicKeyNoCoord),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.next_key !== ""
        ? lastPage?.pagination?.next_key
        : null,
    initialPageParam: "",
    refetchInterval: 60000, // 1 minute
    enabled: !!(btcWallet && publicKeyNoCoord && address),
    select: (data) => {
      const flattenedData = data.pages.reduce<PaginatedDelegations>(
        (acc, page) => {
          acc.delegations.push(...page.delegations);
          acc.pagination = page.pagination;
          return acc;
        },
        { delegations: [], pagination: { next_key: "" } },
      );

      return flattenedData;
    },
    retry: (failureCount, _error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  // Fetch all UTXOs
  const {
    data: availableUTXOs,
    error: availableUTXOsError,
    isError: hasAvailableUTXOsError,
    refetch: refetchAvailableUTXOs,
  } = useQuery({
    queryKey: [UTXO_KEY, address],
    queryFn: async () => {
      if (btcWallet?.getUtxos && address) {
        // all confirmed UTXOs from the wallet
        const mempoolUTXOs = await btcWallet.getUtxos(address);
        // filter out the ordinals
        const filteredUTXOs = await filterOrdinals(
          mempoolUTXOs,
          address,
          btcWallet.getInscriptions,
        );
        return filteredUTXOs;
      }
    },
    enabled: !!(btcWallet?.getUtxos && address),
    refetchInterval: 60000 * 5, // 5 minutes
    retry: (failureCount) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  useEffect(() => {
    handleError({
      error: delegationsError,
      hasError: hasDelegationsError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchDelegationData,
    });
    captureError(delegationsError);
    handleError({
      error: globalParamsVersionError,
      hasError: hasGlobalParamsVersionError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchGlobalParamsVersion,
    });
    captureError(globalParamsVersionError);
    handleError({
      error: availableUTXOsError,
      hasError: hasAvailableUTXOsError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchAvailableUTXOs,
    });
    captureError(availableUTXOsError);
  }, [
    hasGlobalParamsVersionError,
    hasDelegationsError,
    delegationsError,
    refetchDelegationData,
    globalParamsVersionError,
    refetchGlobalParamsVersion,
    showError,
    availableUTXOsError,
    hasAvailableUTXOsError,
    refetchAvailableUTXOs,
    handleError,
    captureError,
  ]);

  // Initializing btc curve is a required one-time operation
  useEffect(() => {
    initBTCCurve();
  }, []);

  // Local storage state for delegations
  const delegationsLocalStorageKey =
    getDelegationsLocalStorageKey(publicKeyNoCoord);

  const [delegationsLocalStorage, setDelegationsLocalStorage] = useLocalStorage<
    Delegation[]
  >(delegationsLocalStorageKey, []);

  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const handleConnectModal = () => {
    setConnectModalOpen(true);
  };

  const handleDisconnectBTC = () => {
    setBTCWallet(undefined);

    setBTCWalletNetwork(undefined);
    setPublicKeyNoCoord("");
    setAddress("");
  };

  const handleConnectBTC = useCallback(
    async (walletProvider: WalletProvider) => {
      // close the modal
      setConnectModalOpen(false);

      const supportedNetworkMessage =
        "Only Native SegWit and Taproot addresses are supported. Please switch the address type in your wallet and try again.";

      try {
        await walletProvider.connectWallet();
        const address = await walletProvider.getAddress();
        // check if the wallet address type is supported in babylon
        const supported = isSupportedAddressType(address);
        if (!supported) {
          throw new Error(supportedNetworkMessage);
        }

        const publicKeyNoCoord = getPublicKeyNoCoord(
          await walletProvider.getPublicKeyHex(),
        );
        setBTCWallet(walletProvider);
        setBTCWalletNetwork(toNetwork(await walletProvider.getNetwork()));
        setAddress(address);
        setPublicKeyNoCoord(publicKeyNoCoord.toString("hex"));
      } catch (error: Error | any) {
        if (
          error instanceof WalletError &&
          error.getType() === WalletErrorType.ConnectionCancelled
        ) {
          // User cancelled the connection, hence do nothing
          return;
        }
        let errorMessage;
        switch (true) {
          case /Incorrect address prefix for (Testnet \/ Signet|Mainnet)/.test(
            error.message,
          ):
            errorMessage = supportedNetworkMessage;
            break;
          default:
            errorMessage = error.message;
            break;
        }
        showError({
          error: {
            message: errorMessage,
            errorState: ErrorState.WALLET,
          },
          retryAction: () => handleConnectBTC(walletProvider),
        });
      }
    },
    [showError],
  );

  // Subscribe to account changes
  useEffect(() => {
    if (btcWallet) {
      let once = false;
      btcWallet.on("accountChanged", () => {
        if (!once) {
          handleConnectBTC(btcWallet);
        }
      });
      return () => {
        once = true;
      };
    }
  }, [btcWallet, handleConnectBTC]);

  // Clean up the local storage delegations
  useEffect(() => {
    if (!delegations?.delegations) {
      return;
    }

    const updateDelegationsLocalStorage = async () => {
      const { areDelegationsDifferent, delegations: newDelegations } =
        await calculateDelegationsDiff(
          delegations.delegations,
          delegationsLocalStorage,
        );
      if (areDelegationsDifferent) {
        setDelegationsLocalStorage(newDelegations);
      }
    };

    updateDelegationsLocalStorage();
  }, [delegations, setDelegationsLocalStorage, delegationsLocalStorage]);

  let totalStakedSat = 0;

  if (delegations) {
    totalStakedSat = delegations.delegations
      // using only active delegations
      .filter((delegation) => delegation?.state === DelegationState.ACTIVE)
      .reduce(
        (accumulator: number, item) => accumulator + item?.stakingValueSat,
        0,
      );
  }

  // Balance is reduced confirmed UTXOs with ordinals
  const btcWalletBalanceSat = availableUTXOs?.reduce(
    (accumulator, item) => accumulator + item.value,
    0,
  );

  return (
    <main
      className={`relative h-full min-h-svh w-full ${network === Network.MAINNET ? "main-app-mainnet" : "main-app-testnet"}`}
    >
      <NetworkBadge isWalletConnected={!!btcWallet} />
      <Header
        onConnect={handleConnectModal}
        onDisconnect={handleDisconnectBTC}
        address={address}
        btcWalletBalanceSat={btcWalletBalanceSat}
      />
      <div className="container mx-auto flex justify-center p-6">
        <div className="container flex flex-col gap-6">
          <Stats />
          {address && (
            <Summary
              totalStakedSat={totalStakedSat}
              btcWalletBalanceSat={btcWalletBalanceSat}
              publicKeyNoCoord={publicKeyNoCoord}
            />
          )}
          <Staking
            btcHeight={paramWithContext?.currentHeight}
            isWalletConnected={!!btcWallet}
            onConnect={handleConnectModal}
            isLoading={isLoadingCurrentParams}
            btcWallet={btcWallet}
            btcWalletBalanceSat={btcWalletBalanceSat}
            btcWalletNetwork={btcWalletNetwork}
            address={address}
            publicKeyNoCoord={publicKeyNoCoord}
            setDelegationsLocalStorage={setDelegationsLocalStorage}
            availableUTXOs={availableUTXOs}
          />
          {btcWallet &&
            delegations &&
            paramWithContext?.nextBlockParams.currentVersion &&
            btcWalletNetwork && (
              <Delegations
                delegationsAPI={delegations.delegations}
                delegationsLocalStorage={delegationsLocalStorage}
                globalParamsVersion={
                  paramWithContext.nextBlockParams.currentVersion
                }
                publicKeyNoCoord={publicKeyNoCoord}
                btcWalletNetwork={btcWalletNetwork}
                address={address}
                signPsbtTx={signPsbtTransaction(btcWallet)}
                pushTx={btcWallet.pushTx}
                queryMeta={{
                  next: fetchNextDelegationsPage,
                  hasMore: hasNextDelegationsPage,
                  isFetchingMore: isFetchingNextDelegationsPage,
                }}
                getNetworkFees={btcWallet.getNetworkFees}
                isWalletConnected={!!btcWallet}
              />
            )}
          {/* At this point of time is not used */}
          {/* <StakersFinalityProviders
            finalityProviders={finalityProvidersData}
            totalActiveTVLSat={stakingStats?.activeTVL}
            connected={!!btcWallet}
          /> */}
        </div>
      </div>
      <FAQ />
      <Footer />
      <ConnectModal
        open={connectModalOpen}
        onClose={setConnectModalOpen}
        onConnect={handleConnectBTC}
        connectDisabled={!!address}
      />
      <ErrorModal
        open={isErrorOpen}
        errorMessage={error.message}
        errorState={error.errorState}
        onClose={hideError}
        onRetry={retryErrorAction}
        noCancel={noCancel}
      />
    </main>
  );
};

export default Home;

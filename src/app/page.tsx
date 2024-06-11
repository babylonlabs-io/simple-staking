"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { networks } from "bitcoinjs-lib";
import { initBTCCurve } from "btc-staking-ts";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { network } from "@/config/network.config";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import {
  getPublicKeyNoCoord,
  isSupportedAddressType,
  toNetwork,
} from "@/utils/wallet/index";
import { Network, WalletProvider } from "@/utils/wallet/wallet_provider";

import { getDelegations, PaginatedDelegations } from "./api/getDelegations";
import {
  getFinalityProviders,
  PaginatedFinalityProviders,
} from "./api/getFinalityProviders";
import { getGlobalParams } from "./api/getGlobalParams";
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
import { ErrorHandlerParam, ErrorState } from "./types/errors";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [btcWallet, setBTCWallet] = useState<WalletProvider>();
  const [btcWalletBalanceSat, setBTCWalletBalanceSat] = useState(0);
  const [btcWalletNetwork, setBTCWalletNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");

  const [address, setAddress] = useState("");
  const { error, isErrorOpen, showError, hideError, retryErrorAction } =
    useError();
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
        height: height,
        ...getCurrentGlobalParamsVersion(height + 1, versions),
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
    data: finalityProviders,
    fetchNextPage: fetchNextFinalityProvidersPage,
    hasNextPage: hasNextFinalityProvidersPage,
    isFetchingNextPage: isFetchingNextFinalityProvidersPage,
    error: finalityProvidersError,
    isError: hasFinalityProvidersError,
    refetch: refetchFinalityProvidersData,
    isRefetchError: isRefetchFinalityProvidersError,
  } = useInfiniteQuery({
    queryKey: ["finality providers"],
    queryFn: ({ pageParam = "" }) => getFinalityProviders(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.next_key !== ""
        ? lastPage?.pagination?.next_key
        : null,
    initialPageParam: "",
    refetchInterval: 60000, // 1 minute
    select: (data) => {
      const flattenedData = data.pages.reduce<PaginatedFinalityProviders>(
        (acc, page) => {
          acc.finalityProviders.push(...page.finalityProviders);
          acc.pagination = page.pagination;
          return acc;
        },
        { finalityProviders: [], pagination: { next_key: "" } },
      );
      return flattenedData;
    },
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
    retry: (failureCount, error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  useEffect(() => {
    const handleError = ({
      error,
      hasError,
      errorState,
      refetchFunction,
    }: ErrorHandlerParam) => {
      if (hasError && error) {
        showError({
          error: {
            message: error.message,
            errorState: errorState,
            errorTime: new Date(),
          },
          retryAction: refetchFunction,
        });
      }
    };

    handleError({
      error: finalityProvidersError,
      hasError: hasFinalityProvidersError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchFinalityProvidersData,
    });
    handleError({
      error: delegationsError,
      hasError: hasDelegationsError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchDelegationData,
    });
    handleError({
      error: globalParamsVersionError,
      hasError: hasGlobalParamsVersionError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchGlobalParamsVersion,
    });
  }, [
    hasFinalityProvidersError,
    hasGlobalParamsVersionError,
    hasDelegationsError,
    isRefetchFinalityProvidersError,
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
    setBTCWalletBalanceSat(0);
    setBTCWalletNetwork(undefined);
    setPublicKeyNoCoord("");
    setAddress("");
  };

  const handleConnectBTC = async (walletProvider: WalletProvider) => {
    // close the modal
    setConnectModalOpen(false);

    try {
      await walletProvider.connectWallet();
      const address = await walletProvider.getAddress();
      // check if the wallet address type is supported in babylon
      const supported = isSupportedAddressType(address);
      if (!supported) {
        throw new Error(
          "Invalid address type. Please use a Native SegWit or Taproot",
        );
      }

      const balanceSat = await walletProvider.getBalance();
      const publicKeyNoCoord = getPublicKeyNoCoord(
        await walletProvider.getPublicKeyHex(),
      );
      setBTCWallet(walletProvider);
      setBTCWalletBalanceSat(balanceSat);
      setBTCWalletNetwork(toNetwork(await walletProvider.getNetwork()));
      setAddress(address);
      setPublicKeyNoCoord(publicKeyNoCoord.toString("hex"));
    } catch (error: Error | any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.WALLET,
          errorTime: new Date(),
        },
        retryAction: () => handleConnectBTC(walletProvider),
      });
    }
  };

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
  }, [btcWallet]);

  // Remove the delegations that are already present in the API
  useEffect(() => {
    if (!delegations) {
      return;
    }
    setDelegationsLocalStorage((localDelegations) =>
      localDelegations?.filter(
        (localDelegation) =>
          !delegations?.delegations.find(
            (delegation) =>
              delegation?.stakingTxHashHex ===
              localDelegation?.stakingTxHashHex,
          ),
      ),
    );
  }, [delegations, setDelegationsLocalStorage]);

  // Finality providers key-value map { pk: moniker }
  const finalityProvidersKV = finalityProviders?.finalityProviders.reduce(
    (acc, fp) => ({ ...acc, [fp?.btcPk]: fp?.description?.moniker }),
    {},
  );

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

  return (
    <main
      className={`relative h-full min-h-svh w-full ${network === Network.MAINNET ? "main-app-mainnet" : "main-app-testnet"}`}
    >
      <NetworkBadge />
      <Header
        onConnect={handleConnectModal}
        onDisconnect={handleDisconnectBTC}
        address={address}
        balanceSat={btcWalletBalanceSat}
      />
      <div className="container mx-auto flex justify-center p-6">
        <div className="container flex flex-col gap-6">
          <Stats />
          {address && btcWalletBalanceSat && (
            <Summary
              address={address}
              totalStakedSat={totalStakedSat}
              balanceSat={btcWalletBalanceSat}
            />
          )}
          <Staking
            btcHeight={paramWithContext?.height}
            finalityProviders={finalityProviders?.finalityProviders}
            isWalletConnected={!!btcWallet}
            onConnect={handleConnectModal}
            finalityProvidersFetchNext={fetchNextFinalityProvidersPage}
            finalityProvidersHasNext={hasNextFinalityProvidersPage}
            finalityProvidersIsFetchingMore={
              isFetchingNextFinalityProvidersPage
            }
            isLoading={isLoadingCurrentParams}
            btcWallet={btcWallet}
            btcWalletBalanceSat={btcWalletBalanceSat}
            btcWalletNetwork={btcWalletNetwork}
            address={address}
            publicKeyNoCoord={publicKeyNoCoord}
            setDelegationsLocalStorage={setDelegationsLocalStorage}
          />
          {btcWallet &&
            delegations &&
            paramWithContext?.currentVersion &&
            btcWalletNetwork &&
            finalityProvidersKV && (
              <Delegations
                finalityProvidersKV={finalityProvidersKV}
                delegationsAPI={delegations.delegations}
                delegationsLocalStorage={delegationsLocalStorage}
                globalParamsVersion={paramWithContext.currentVersion}
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
        errorTime={error.errorTime}
        onClose={hideError}
        onRetry={retryErrorAction}
      />
    </main>
  );
};

export default Home;

"use client";

import { useEffect, useState } from "react";
import { initBTCCurve } from "btc-staking-ts";
import { useLocalStorage } from "usehooks-ts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { networks } from "bitcoinjs-lib";

import {
  getWallet,
  toNetwork,
  isSupportedAddressType,
  getPublicKeyNoCoord,
} from "@/utils/wallet/index";
import { getFinalityProviders } from "./api/getFinalityProviders";
import { getDelegations } from "./api/getDelegations";
import { Delegation, DelegationState } from "./types/delegations";
import { Staking } from "./components/Staking/Staking";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { Delegations } from "./components/Delegations/Delegations";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { Header } from "./components/Header/Header";
import { Stats } from "./components/Stats/Stats";
import { getStats } from "./api/getStats";
import { Summary } from "./components/Summary/Summary";
import { Footer } from "./components/Footer/Footer";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { FAQ } from "./components/FAQ/FAQ";
import { ConnectModal } from "./components/Modals/ConnectModal";
import { NetworkBadge } from "./components/NetworkBadge/NetworkBadge";
import { getGlobalParams } from "./api/getGlobalParams";
import { ErrorModal } from "./components/Modals/ErrorModal";
import { useError } from "./context/Error/ErrorContext";
import { ErrorHandlerParam, ErrorState } from "./types/errors";

interface HomeProps {}

const withdrawalFeeSat = 500;

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
      try {
        return await getCurrentGlobalParamsVersion(height + 1, versions);
      } catch (error) {
        // No global params version found, it means the staking is not yet enabled
        return {
          currentVersion: undefined,
          isApprochingNextVersion: false,
        };
      }
    },
    refetchInterval: 60000, // 1 minute
    // Should be enabled only when the wallet is connected
    enabled: !!btcWallet,
    retry: (failureCount, error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const {
    data: finalityProvidersData,
    error: finalityProvidersError,
    isError: hasFinalityProvidersError,
    refetch: refetchFinalityProvidersData,
    isRefetchError: isRefetchFinalityProvidersError,
  } = useQuery({
    queryKey: ["finality providers"],
    queryFn: getFinalityProviders,
    refetchInterval: 60000, // 1 minute
    retry: (failureCount, error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const {
    data: delegations,
    fetchNextPage: _fetchNextDelegationsPage,
    error: delegationsError,
    isError: hasDelegationsError,
    refetch: refetchDelegationData,
  } = useInfiniteQuery({
    queryKey: ["delegations", address],
    queryFn: ({ pageParam = "" }) =>
      getDelegations(pageParam, publicKeyNoCoord),
    getNextPageParam: (lastPage) => lastPage?.pagination?.nextKey,
    initialPageParam: "",
    refetchInterval: 60000, // 1 minute
    enabled: !!(btcWallet && publicKeyNoCoord && address),
    select: (data) => data?.pages?.flatMap((page) => page?.delegations),
    retry: (failureCount, error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const {
    data: stakingStats,
    isLoading: stakingStatsIsLoading,
    error: statsError,
    isError: hasStatsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchInterval: 60000, // 1 minute
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
      errorState: ErrorState.GET_FINALITY_PROVIDER,
      refetchFunction: refetchFinalityProvidersData,
    });
    handleError({
      error: delegationsError,
      hasError: hasDelegationsError,
      errorState: ErrorState.GET_DELEGATION,
      refetchFunction: refetchDelegationData,
    });
    handleError({
      error: statsError,
      hasError: hasStatsError,
      errorState: ErrorState.GET_STATS,
      refetchFunction: refetchStats,
    });
    handleError({
      error: globalParamsVersionError,
      hasError: hasGlobalParamsVersionError,
      errorState: ErrorState.GET_GLOBAL_PARAMS,
      refetchFunction: refetchGlobalParamsVersion,
    });
  }, [
    hasFinalityProvidersError,
    hasGlobalParamsVersionError,
    hasDelegationsError,
    hasStatsError,
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

  const handleConnectBTC = async () => {
    // close the modal
    setConnectModalOpen(false);

    try {
      const walletProvider = getWallet();
      await walletProvider.connectWallet();
      const address = await walletProvider.getAddress();
      // check if the wallet address type is supported in babylon
      const supported = isSupportedAddressType(address);
      if (!supported) {
        throw new Error(
          "Invalid address type. Please use a Native SegWit or Taptoor",
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
          errorState: ErrorState.SWITCH_NETWORK,
          errorTime: new Date(),
        },
        retryAction: handleConnectBTC,
      });
    }
  };

  // Subscribe to account changes
  useEffect(() => {
    if (btcWallet) {
      let once = false;
      btcWallet.on("accountChanged", () => {
        if (!once) {
          handleConnectBTC();
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
          !delegations?.find(
            (delegation) =>
              delegation?.stakingTxHashHex ===
              localDelegation?.stakingTxHashHex,
          ),
      ),
    );
  }, [delegations, setDelegationsLocalStorage]);

  // Finality providers key-value map { pk: moniker }
  const finalityProvidersKV = finalityProvidersData?.reduce(
    (acc, fp) => ({ ...acc, [fp?.btcPk]: fp?.description?.moniker }),
    {},
  );

  let totalStakedSat = 0;

  if (delegations) {
    totalStakedSat = delegations
      // using only active delegations
      .filter((delegation) => delegation?.state === DelegationState.ACTIVE)
      .reduce(
        (accumulator: number, item) => accumulator + item?.stakingValueSat,
        0,
      );
  }

  // these constants are needed for easier prop passing
  const overTheCap =
    paramWithContext?.currentVersion && stakingStats
      ? paramWithContext.currentVersion.stakingCapSat <=
        stakingStats.activeTVLSat
      : false;

  return (
    <main className="main-app relative h-full min-h-svh w-full">
      <NetworkBadge />
      <Header
        onConnect={handleConnectModal}
        onDisconnect={handleDisconnectBTC}
        address={address}
        balanceSat={btcWalletBalanceSat}
      />
      <div className="container mx-auto flex justify-center p-6">
        <div className="container flex flex-col gap-6">
          <Stats
            stakingStats={stakingStats}
            isLoading={stakingStatsIsLoading}
            stakingCapSat={paramWithContext?.currentVersion?.stakingCapSat}
          />
          {address && btcWalletBalanceSat && (
            <Summary
              address={address}
              totalStakedSat={totalStakedSat}
              balanceSat={btcWalletBalanceSat}
            />
          )}
          <Staking
            finalityProviders={finalityProvidersData}
            paramWithContext={paramWithContext}
            isWalletConnected={!!btcWallet}
            overTheCap={overTheCap}
            onConnect={handleConnectModal}
            isLoading={isLoadingCurrentParams}
            btcWallet={btcWallet}
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
                delegationsAPI={delegations}
                delegationsLocalStorage={delegationsLocalStorage}
                globalParamsVersion={paramWithContext.currentVersion}
                publicKeyNoCoord={publicKeyNoCoord}
                unbondingFeeSat={
                  paramWithContext.currentVersion.unbondingFeeSat
                }
                withdrawalFeeSat={withdrawalFeeSat}
                btcWalletNetwork={btcWalletNetwork}
                address={address}
                signPsbt={btcWallet.signPsbt}
                pushTx={btcWallet.pushTx}
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

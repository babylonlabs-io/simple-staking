"use client";

import { useEffect, useState } from "react";
import { initBTCCurve } from "btc-staking-ts";
import { useLocalStorage } from "usehooks-ts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Transaction, networks } from "bitcoinjs-lib";

import {
  getWallet,
  toNetwork,
  isSupportedAddressType,
  getPublicKeyNoCoord,
} from "@/utils/wallet/index";
import {
  FinalityProvider,
  getFinalityProviders,
} from "./api/getFinalityProviders";
import { Delegation, getDelegations } from "./api/getDelegations";
import { Staking } from "./components/Staking/Staking";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { Delegations } from "./components/Delegations/Delegations";
import { toLocalStorageDelegation } from "@/utils/local_storage/toLocalStorageDelegation";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { Header } from "./components/Header/Header";
import { Stats } from "./components/Stats/Stats";
import { getStats } from "./api/getStats";
import { Summary } from "./components/Summary/Summary";
import { DelegationState } from "./types/delegationState";
import { Footer } from "./components/Footer/Footer";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { FAQ } from "./components/FAQ/FAQ";
import { ConnectModal } from "./components/Modals/ConnectModal";
import { signForm } from "@/utils/signForm";
import { getStakingTerm } from "@/utils/getStakingTerm";
import { NetworkBadge } from "./components/NetworkBadge/NetworkBadge";
import { getGlobalParams } from "./api/getGlobalParams";
import { ErrorModal } from "./components/Modals/ErrorModal";
import { useError } from "./context/Error/ErrorContext";
import { ErrorState } from "./types/errorState";

interface HomeProps { }

const stakingFeeSat = 500;
const withdrawalFeeSat = 500;

const Home: React.FC<HomeProps> = () => {
  const [btcWallet, setBTCWallet] = useState<WalletProvider>();
  const [btcWalletBalanceSat, setBTCWalletBalanceSat] = useState(0);
  const [btcWalletNetwork, setBTCWalletNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");

  const [address, setAddress] = useState("");
  const [amountSat, setAmountSat] = useState(0);
  const [term, setTerm] = useState(0);
  const [finalityProvider, setFinalityProvider] = useState<FinalityProvider>();
  const { error, isErrorOpen, showError, hideError, retryErrorAction } =
    useError();

  const {
    data: paramWithContext,
    isLoading: isLoadingCurrentParams,
    error: globalParamsVersionError,
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
    retry: false,
  });

  useEffect(() => {
    if (globalParamsVersionError) {
      showError({
        error: {
          message: globalParamsVersionError.message,
          errorState: ErrorState.GET_GLOBAL_PARAMS,
          errorTime: new Date(),
        },
        retryAction: refetchGlobalParamsVersion,
      });
    }
    return () => {
      hideError();
    };
  }, [globalParamsVersionError, refetchGlobalParamsVersion, showError, hideError]);

  const {
    data: finalityProvidersData,
    error: finalityProvidersError,
    refetch: refetchFinalityProvidersData,
  } = useQuery({
    queryKey: ["finality providers"],
    queryFn: getFinalityProviders,
    refetchInterval: 60000, // 1 minute
    select: (data) => data.data,
    retry: false,
  });

  useEffect(() => {
    if (finalityProvidersError) {
      showError({
        error: {
          message: finalityProvidersError.message,
          errorState: ErrorState.GET_FINALITY_PROVIDER,
          errorTime: new Date(),
        },
        retryAction: refetchFinalityProvidersData,
      });
    }
    return () => {
      hideError();
    };
  }, [finalityProvidersError, refetchFinalityProvidersData, showError, hideError]);

  const {
    data: delegationsData,
    fetchNextPage: _fetchNextDelegationsPage,
    refetch: refetchDelegationData,
    error: delegationError,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["delegations", address],
    queryFn: ({ pageParam = "" }) =>
      getDelegations(pageParam, publicKeyNoCoord),
    getNextPageParam: (lastPage) => lastPage?.pagination?.next_key,
    initialPageParam: "",
    refetchInterval: 60000, // 1 minute
    enabled: !!(btcWallet && publicKeyNoCoord && address),
    select: (data) => data?.pages?.flatMap((page) => page?.data),
    retry: false,
  });

  useEffect(() => {
    if (delegationError) {
      showError({
        error: {
          message: delegationError.message,
          errorState: ErrorState.GET_DELEGATION,
          errorTime: new Date(),
        },
        retryAction: refetchDelegationData,
      });
    }
    return () => {
      hideError();
    };
  }, [delegationError, refetchDelegationData, showError, hideError]);

  const {
    data: statsData,
    isLoading: statsDataIsLoading,
    refetch: refetchStats,
    error: statsError,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchInterval: 60000, // 1 minute
    select: (data) => data.data,
    retry: false,
  });

  useEffect(() => {
    if (statsError) {
      showError({
        error: {
          message: statsError.message,
          errorState: ErrorState.GET_STATS,
          errorTime: new Date(),
        },
        retryAction: refetchStats,
      });
    }
    return () => {
      hideError();
    };
  }, [statsError, refetchStats, showError, hideError]);

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

  // Select the finality provider from the list
  const handleChooseFinalityProvider = (btcPkHex: string) => {
    if (!finalityProvidersData) {
      return;
    }
    const found = finalityProvidersData.find((fp) => fp?.btc_pk === btcPkHex);
    if (found) {
      setFinalityProvider(found);
    }
  };

  const handleSign = async () => {
    try {
      if (!btcWallet) {
        throw new Error("Wallet not connected");
      } else if (!btcWalletNetwork) {
        throw new Error("Wallet network not connected");
      } else if (!paramWithContext || !paramWithContext.currentVersion) {
        throw new Error("Global params not loaded");
      } else if (!finalityProvider) {
        throw new Error("Finality provider not selected");
      }
      const { currentVersion: globalParamsVersion } = paramWithContext;
      const stakingTerm = getStakingTerm(globalParamsVersion, term);
      let signedTxHex: string;
      try {
        signedTxHex = await signForm(
          globalParamsVersion,
          btcWallet,
          finalityProvider,
          stakingTerm,
          btcWalletNetwork,
          amountSat,
          address,
          stakingFeeSat,
          publicKeyNoCoord,
        );
      } catch (error: Error | any) {
        throw error;
      }

      let txID;
      try {
        txID = await btcWallet.pushTx(signedTxHex);
      } catch (error: Error | any) {
        throw error;
      }

      // Update the local state with the new delegation
      setDelegationsLocalStorage((delegations) => [
        toLocalStorageDelegation(
          Transaction.fromHex(signedTxHex).getId(),
          publicKeyNoCoord,
          finalityProvider.btc_pk,
          amountSat,
          signedTxHex,
          stakingTerm,
        ),
        ...delegations,
      ]);

      // Clear the form
      setAmountSat(0);
      setTerm(0);
      setFinalityProvider(undefined);
    } catch (error: Error | any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.STAKING,
          errorTime: new Date(),
        },
        retryAction: handleSign,
      });
    }
  };

  // Remove the delegations that are already present in the API
  useEffect(() => {
    if (!delegationsData) {
      return;
    }
    setDelegationsLocalStorage((localDelegations) =>
      localDelegations?.filter(
        (localDelegation) =>
          !delegationsData?.find(
            (delegation) =>
              delegation?.staking_tx_hash_hex ===
              localDelegation?.staking_tx_hash_hex,
          ),
      ),
    );
  }, [delegationsData, setDelegationsLocalStorage]);

  // Finality providers key-value map { pk: moniker }
  const finalityProvidersKV = finalityProvidersData?.reduce(
    (acc, fp) => ({ ...acc, [fp?.btc_pk]: fp?.description?.moniker }),
    {},
  );

  let totalStakedSat = 0;

  if (delegationsData) {
    totalStakedSat = delegationsData
      // using only active delegations
      .filter((delegation) => delegation?.state === DelegationState.ACTIVE)
      .reduce(
        (accumulator: number, item) => accumulator + item?.staking_value,
        0,
      );
  }

  // these constants are needed for easier prop passing
  const overTheCap =
    paramWithContext?.currentVersion && statsData
      ? paramWithContext.currentVersion.stakingCapSat <= statsData.active_tvl
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
            data={statsData}
            isLoading={statsDataIsLoading}
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
            amountSat={amountSat}
            onAmountSatChange={setAmountSat}
            term={term}
            onTermChange={setTerm}
            finalityProviders={finalityProvidersData}
            selectedFinalityProvider={finalityProvider}
            onFinalityProviderChange={handleChooseFinalityProvider}
            onSign={handleSign}
            stakingParams={paramWithContext?.currentVersion}
            isWalletConnected={!!btcWallet}
            overTheCap={overTheCap}
            onConnect={handleConnectModal}
            isLoading={isLoadingCurrentParams}
            isUpgrading={paramWithContext?.isApprochingNextVersion}
          />
          {btcWallet &&
            delegationsData &&
            paramWithContext?.currentVersion &&
            btcWalletNetwork &&
            finalityProvidersKV && (
              <Delegations
                finalityProvidersKV={finalityProvidersKV}
                delegationsAPI={delegationsData}
                delegationsLocalStorage={delegationsLocalStorage}
                globalParamsVersion={paramWithContext.currentVersion}
                publicKeyNoCoord={publicKeyNoCoord}
                unbondingFeeSat={paramWithContext.currentVersion.unbondingFeeSat}
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
            totalActiveTVLSat={statsData?.active_tvl}
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

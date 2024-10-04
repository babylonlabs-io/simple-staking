"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

import { network } from "@/config/network.config";
import { calculateDelegationsDiff } from "@/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { filterOrdinals } from "@/utils/utxo";
import { Network } from "@/utils/wallet/wallet_provider";

import { getDelegations, PaginatedDelegations } from "./api/getDelegations";
import { UTXO_KEY } from "./common/constants";
import { signPsbtTransaction } from "./common/utils/psbt";
import { Delegations } from "./components/Delegations/Delegations";
import { FAQ } from "./components/FAQ/FAQ";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { NetworkBadge } from "./components/NetworkBadge/NetworkBadge";
import { Staking } from "./components/Staking/Staking";
import { Stats } from "./components/Stats/Stats";
import { Summary } from "./components/Summary/Summary";
import { useVersionInfo } from "./context/api/VersionInfo";
import { useError } from "./context/Error/ErrorContext";
import { useWallet } from "./context/wallet/WalletProvider";
import { Delegation, DelegationState } from "./types/delegations";
import { ErrorState } from "./types/errors";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const {
    walletProvider: btcWallet,
    network: btcWalletNetwork,
    address,
    publicKeyNoCoord,
  } = useWallet();

  const { isErrorOpen, showError, handleError, captureError } = useError();

  const versionInfo = useVersionInfo();

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
    isLoading: isLoadingAvailableUTXOs,
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
      error: availableUTXOsError,
      hasError: hasAvailableUTXOsError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchAvailableUTXOs,
    });
    captureError(availableUTXOsError);
  }, [
    hasDelegationsError,
    delegationsError,
    refetchDelegationData,
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
        loading={isLoadingAvailableUTXOs}
        btcWalletBalanceSat={btcWalletBalanceSat}
      />
      <div className="container mx-auto flex justify-center p-6">
        <div className="container flex flex-col gap-6">
          <Stats />
          {address && (
            <Summary
              loading={isLoadingAvailableUTXOs}
              totalStakedSat={totalStakedSat}
              btcWalletBalanceSat={btcWalletBalanceSat}
              publicKeyNoCoord={publicKeyNoCoord}
            />
          )}
          <Staking
            disabled={versionInfo?.isError || hasAvailableUTXOsError}
            btcHeight={versionInfo?.currentHeight}
            isLoading={versionInfo?.isLoading || isLoadingAvailableUTXOs}
            btcWalletBalanceSat={btcWalletBalanceSat}
            setDelegationsLocalStorage={setDelegationsLocalStorage}
            availableUTXOs={availableUTXOs}
          />
          {btcWallet &&
            delegations &&
            versionInfo?.currentVersion &&
            btcWalletNetwork && (
              <Delegations
                delegationsAPI={delegations.delegations}
                delegationsLocalStorage={delegationsLocalStorage}
                globalParamsVersion={versionInfo.currentVersion}
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
    </main>
  );
};

export default Home;

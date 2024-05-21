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
import {
  getFinalityProviders,
  PaginatedFinalityProviders,
} from "./api/getFinalityProviders";
import { getDelegations, PaginatedDelegations } from "./api/getDelegations";
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

interface HomeProps {}

const withdrawalFeeSat = 500;

const Home: React.FC<HomeProps> = () => {
  const [btcWallet, setBTCWallet] = useState<WalletProvider>();
  const [btcWalletBalanceSat, setBTCWalletBalanceSat] = useState(0);
  const [btcWalletNetwork, setBTCWalletNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");

  const [address, setAddress] = useState("");

  const { data: paramWithContext, isLoading: isLoadingCurrentParams } =
    useQuery({
      queryKey: ["global params"],
      queryFn: async () => {
        const [height, versions] = await Promise.all([
          btcWallet!.getBTCTipHeight(),
          getGlobalParams(),
        ]);
        try {
          return getCurrentGlobalParamsVersion(height + 1, versions);
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
    });

  const {
    data: finalityProviders,
    fetchNextPage: fetchNextFinalityProvidersPage,
    hasNextPage: hasNextFinalityProvidersPage,
    isFetchingNextPage: isFetchingNextFinalityProvidersPage,
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
  });

  const {
    data: delegations,
    fetchNextPage: fetchNextDelegationsPage,
    hasNextPage: hasNextDelegationsPage,
    isFetchingNextPage: isFetchingNextDelegationsPage,
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
  });

  const { data: stakingStats, isLoading: stakingStatsIsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchInterval: 60000, // 1 minute
  });

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
      console.error(error?.message || error);
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
            finalityProviders={finalityProviders?.finalityProviders}
            paramWithContext={paramWithContext}
            isWalletConnected={!!btcWallet}
            overTheCap={overTheCap}
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
                unbondingFeeSat={
                  paramWithContext.currentVersion.unbondingFeeSat
                }
                withdrawalFeeSat={withdrawalFeeSat}
                btcWalletNetwork={btcWalletNetwork}
                address={address}
                signPsbt={btcWallet.signPsbt}
                pushTx={btcWallet.pushTx}
                queryMeta={{
                  next: fetchNextDelegationsPage,
                  hasMore: hasNextDelegationsPage,
                  isFetchingMore: isFetchingNextDelegationsPage,
                }}
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
    </main>
  );
};

export default Home;

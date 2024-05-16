"use client";

import { useEffect, useState } from "react";
import { initBTCCurve, stakingTransaction } from "btc-staking-ts";
import { useLocalStorage } from "usehooks-ts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Transaction, networks, Psbt } from "bitcoinjs-lib";

import {
  getWallet,
  toNetwork,
  isSupportedAddressType,
  isTaproot,
  getPublicKeyNoCoord,
} from "@/utils/wallet/index";
import {
  FinalityProvider,
  FinalityProviders as FinalityProvidersType,
  getFinalityProviders,
} from "./api/getFinalityProviders";
import { Delegation, Delegations as DelegationsType, getDelegations } from "./api/getDelegations";
import { Staking } from "./components/Staking/Staking";
import { apiDataToStakingScripts } from "@/utils/apiDataToStakingScripts";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { Delegations } from "./components/Delegations/Delegations";
import { toLocalStorageDelegation } from "@/utils/local_storage/toLocalStorageDelegation";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { useTheme } from "./hooks/useTheme";
import { Header } from "./components/Header/Header";
import { Stats } from "./components/Stats/Stats";
import { getStats } from "./api/getStats";
import { Summary } from "./components/Summary/Summary";
import { DelegationState } from "./types/delegationState";
import { Footer } from "./components/Footer/Footer";
import { getCurrentGlobalParamsVersion } from "@/utils/getCurrentGlobalParamsVersion";
import { FAQ } from "./components/FAQ/FAQ";
import { ConnectModal } from "./components/Modals/ConnectModal";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const { lightSelected } = useTheme();

  const [btcWallet, setBTCWallet] = useState<WalletProvider>();
  const [btcWalletBalance, setBTCWalletBalance] = useState(0);
  const [btcWalletNetwork, setBTCWalletNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [term, setTerm] = useState(0);
  const [finalityProvider, setFinalityProvider] = useState<FinalityProvider>();

  const { data: globalParamsVersion } = useQuery({
    queryKey: ["global params"],
    queryFn: async () => {
      const currentBtcHeight = await btcWallet!.getBTCTipHeight();
      return getCurrentGlobalParamsVersion(currentBtcHeight);
    },
    refetchInterval: 60000, // 1 minute
    // Should be enabled only when the wallet is connected
    enabled: !!btcWallet,
  });

  const {
    data: finalityProvidersData,
    isLoading: isLoadingFinalityProvidersData,
    fetchNextPage: _fetchNextFinalityProvidersPage,
    hasNextPage: hasNextFinalityProvidersPage,
    isFetchingNextPage: isFetchingNextFinalityProvidersPage,
  } = useInfiniteQuery({
    queryKey: ["finality providers"],
    queryFn: ({ pageParam = "" }) => getFinalityProviders(pageParam),
    getNextPageParam: (lastPage) => lastPage?.pagination?.next_key ?? null,
    initialPageParam: "",
    refetchInterval: 60000, // 1 minute
    select: (data) => {
      const flattenedData = data.pages.reduce<FinalityProvidersType>(
        (acc, page) => {
          acc.data.push(...page.data);
          acc.pagination = page.pagination;
          return acc;
        },
        { data: [], pagination: { next_key: "" } }
      );
      return flattenedData;
    }
  });


  const {
    data: delegationsData,
    fetchNextPage: _fetchNextDelegationsPage,
    hasNextPage: hasNextDelegationsPage,
    isFetchingNextPage: isFetchingNextDelegationsPage,
    isLoading: isLoadingDelegationsData,
  } =
    useInfiniteQuery({
      queryKey: ["delegations", address, publicKeyNoCoord],
      queryFn: ({ pageParam = "" }) =>
      getDelegations(pageParam, publicKeyNoCoord),
      getNextPageParam: (lastPage) => lastPage?.pagination?.next_key ?? null,
      initialPageParam: "",
      refetchInterval: 60000, // 1 minute
      enabled: !!(btcWallet && publicKeyNoCoord && address),
      select: (data) => {
        const flattenedData = data.pages.reduce<DelegationsType>(
          (acc, page) => {
            acc.data.push(...page.data);
            acc.pagination = page.pagination;
            return acc;
          },
          { data: [], pagination: { next_key: "" } }
        );

        return flattenedData;
      }
    });

  const { data: statsData, isLoading: statsDataIsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchInterval: 60000, // 1 minute
    select: (data) => data.data,
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
    setBTCWalletBalance(0);
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

      const balance = await walletProvider.getBalance();
      const publicKeyNoCoord = getPublicKeyNoCoord(
        await walletProvider.getPublicKeyHex(),
      );
      setBTCWallet(walletProvider);
      setBTCWalletBalance(balance);
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

  // Select the finality provider from the list
  const handleChooseFinalityProvider = (btcPkHex: string) => {
    if (!finalityProvidersData) {
      return;
    }
    const found = finalityProvidersData.data.find((fp) => fp?.btc_pk === btcPkHex);
    if (found) {
      setFinalityProvider(found);
    }
  };

  const walletAndDataReady =
    !!btcWallet && !!globalParamsVersion && !!finalityProvidersData;

  const stakingFee = 500;
  const withdrawalFee = 500;

  const handleSign = async () => {
    // check if term is fixed
    let termWithFixed;
    if (
      globalParamsVersion &&
      globalParamsVersion.min_staking_time ===
        globalParamsVersion.max_staking_time
    ) {
      // if term is fixed, use the API value
      termWithFixed = globalParamsVersion.min_staking_time;
    } else {
      // if term is not fixed, use the term from the input
      termWithFixed = term;
    }

    if (
      !walletAndDataReady ||
      !finalityProvider ||
      !btcWalletNetwork ||
      amount * 1e8 < globalParamsVersion.min_staking_amount ||
      amount * 1e8 > globalParamsVersion.max_staking_amount ||
      termWithFixed < globalParamsVersion.min_staking_time ||
      termWithFixed > globalParamsVersion.max_staking_time
    ) {
      // TODO Show Popup
      console.error("Invalid staking data");
      return;
    }

    // Rounding the input since 0.0006 * 1e8 is is 59999.999
    // which won't be accepted by the mempool API
    const stakingAmount = Math.round(Number(amount) * 1e8);
    const stakingTerm = Number(termWithFixed);
    let inputUTXOs = [];
    try {
      inputUTXOs = await btcWallet.getUtxos(
        address,
        stakingAmount + stakingFee,
      );
    } catch (error: Error | any) {
      console.error(error?.message || "UTXOs error");
      return;
    }
    if (inputUTXOs.length == 0) {
      console.error("Confirmed UTXOs not enough");
      return;
    }

    let scripts;
    try {
      scripts = apiDataToStakingScripts(
        finalityProvider.btc_pk,
        stakingTerm,
        globalParamsVersion,
        publicKeyNoCoord,
      );
    } catch (error: Error | any) {
      console.error(error?.message || "Cannot build staking scripts");
      return;
    }

    const timelockScript = scripts.timelockScript;
    const dataEmbedScript = scripts.dataEmbedScript;
    const unbondingScript = scripts.unbondingScript;
    const slashingScript = scripts.slashingScript;
    let unsignedStakingTx;
    try {
      unsignedStakingTx = stakingTransaction(
        timelockScript,
        unbondingScript,
        slashingScript,
        stakingAmount,
        stakingFee,
        address,
        inputUTXOs,
        btcWalletNetwork,
        isTaproot(address) ? Buffer.from(publicKeyNoCoord, "hex") : undefined,
        dataEmbedScript,
      );
    } catch (error: Error | any) {
      console.error(
        error?.message || "Cannot build unsigned staking transaction",
      );
      return;
    }
    let stakingTx: string;
    try {
      const signedPsbt = await btcWallet.signPsbt(unsignedStakingTx.toHex());
      stakingTx = Psbt.fromHex(signedPsbt).extractTransaction().toHex();
    } catch (error: Error | any) {
      console.error(error?.message || "Staking transaction signing PSBT error");
      return;
    }

    let txID;
    try {
      txID = await btcWallet.pushTx(stakingTx);
    } catch (error: Error | any) {
      console.error(error?.message || "Broadcasting staking transaction error");
    }

    // Update the local state with the new delegation
    setDelegationsLocalStorage((delegations) => [
      toLocalStorageDelegation(
        Transaction.fromHex(stakingTx).getId(),
        publicKeyNoCoord,
        finalityProvider.btc_pk,
        stakingAmount,
        stakingTx,
        stakingTerm,
      ),
      ...delegations,
    ]);

    // Clear the form
    setAmount(0);
    setTerm(0);
    setFinalityProvider(undefined);
  };

  // Remove the delegations that are already present in the API
  useEffect(() => {
    if (!delegationsData) {
      return;
    }
    setDelegationsLocalStorage((localDelegations) =>
      localDelegations?.filter(
        (localDelegation) =>
          !delegationsData?.data.find(
            (delegation) =>
              delegation?.staking_tx_hash_hex ===
              localDelegation?.staking_tx_hash_hex,
          ),
      ),
    );
  }, [delegationsData, setDelegationsLocalStorage]);

  // Finality providers key-value map { pk: moniker }
  const finalityProvidersKV = finalityProvidersData?.data.reduce(
    (acc, fp) => ({ ...acc, [fp?.btc_pk]: fp?.description?.moniker }),
    {},
  );

  let totalStaked = 0;

  if (delegationsData) {
    totalStaked = delegationsData
      .data
      // using only active delegations
      .filter((delegation) => delegation?.state === DelegationState.ACTIVE)
      .reduce(
        (accumulator: number, item) => accumulator + item?.staking_value,
        0,
      );
  }

  // these constants are needed for easier prop passing

  const overTheCap =
    globalParamsVersion && statsData
      ? globalParamsVersion.staking_cap <= statsData.active_tvl
      : false;

  return (
    <main
      className={`h-full min-h-svh w-full ${lightSelected ? "light" : "dark"}`}
    >
      <Header
        onConnect={handleConnectModal}
        onDisconnect={handleDisconnectBTC}
        address={address}
        balance={btcWalletBalance}
      />
      <div className="container mx-auto flex justify-center p-6">
        <div className="container flex flex-col gap-6">
          <Stats
            data={statsData}
            isLoading={statsDataIsLoading}
            stakingCap={globalParamsVersion?.staking_cap}
          />
          {address && btcWalletBalance && (
            <Summary
              address={address}
              totalStaked={totalStaked}
              balance={btcWalletBalance}
            />
          )}
          <Staking
            amount={amount}
            onAmountChange={setAmount}
            term={term}
            onTermChange={setTerm}
            disabled={!btcWallet}
            finalityProviders={finalityProvidersData && finalityProvidersData.data}
            selectedFinalityProvider={finalityProvider}
            onFinalityProviderChange={handleChooseFinalityProvider}
            onSign={handleSign}
            minAmount={globalParamsVersion?.min_staking_amount}
            maxAmount={globalParamsVersion?.max_staking_amount}
            minTerm={globalParamsVersion?.min_staking_time}
            maxTerm={globalParamsVersion?.max_staking_time}
            overTheCap={overTheCap}
            onConnect={handleConnectModal}
            finalityProvidersFetchNext={_fetchNextFinalityProvidersPage}
            finalityProvidersHasNext={hasNextFinalityProvidersPage}
            finalityProvidersIsLoading={isLoadingFinalityProvidersData}
            finalityProvidersIsFetchingMore={isFetchingNextFinalityProvidersPage}
          />
          {btcWallet &&
            delegationsData &&
            globalParamsVersion &&
            btcWalletNetwork &&
            finalityProvidersKV && (
              <Delegations
                finalityProvidersKV={finalityProvidersKV}
                delegationsAPI={delegationsData.data}
                delegationsLocalStorage={delegationsLocalStorage}
                globalParamsVersion={globalParamsVersion}
                publicKeyNoCoord={publicKeyNoCoord}
                unbondingFee={globalParamsVersion.unbonding_fee}
                withdrawalFee={withdrawalFee}
                btcWalletNetwork={btcWalletNetwork}
                address={address}
                signPsbt={btcWallet.signPsbt}
                pushTx={btcWallet.pushTx}
                next={_fetchNextDelegationsPage}
                hasMore={hasNextDelegationsPage}
                isFetchingMore={isFetchingNextDelegationsPage}
                isLoading={isLoadingDelegationsData}
              />
            )}
          {/* At this point of time is not used */}
          {/* <StakersFinalityProviders
            finalityProviders={finalityProvidersData}
            totalActiveTVL={statsData?.active_tvl}
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

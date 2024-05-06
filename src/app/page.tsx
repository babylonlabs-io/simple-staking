"use client";

import { useEffect, useState } from "react";
import { initBTCCurve, stakingTransaction } from "btc-staking-ts";
import { useLocalStorage } from "usehooks-ts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Transaction, networks } from "bitcoinjs-lib";

import {
  getWallet,
  toNetwork,
  isSupportedAddressType,
  isTaproot,
  getPublicKeyNoCoord,
} from "@/utils/wallet/index";
import {
  FinalityProvider,
  getFinalityProviders,
} from "./api/getFinalityProviders";
import { GlobalParamsVersion, getGlobalParams } from "./api/getGlobalParams";
import { Delegation, getDelegations } from "./api/getDelegations";
import { Staking } from "./components/Staking/Staking";
import { apiDataToStakingScripts } from "@/utils/apiDataToStakingScripts";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { Delegations } from "./components/Delegations/Delegations";
import { toLocalStorageDelegation } from "@/utils/local_storage/toLocalStorageDelegation";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { useTheme } from "./hooks/useTheme";
import { Header } from "./components/Header/Header";
import { ConnectLarge } from "./components/Connect/ConnectLarge";
import { Stats } from "./components/Stats/Stats";
import { Stakers } from "./components/Stakers/Stakers";
import { FinalityProviders } from "./components/FinalityProviders/FinalityProviders";
import { getStats } from "./api/getStats";
import { Summary } from "./components/Summary/Summary";
import { DelegationState } from "./types/delegationState";
import { Footer } from "./components/Footer/Footer";

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

  const getCurrentGlobalParamsVersion = async (
    // manual height is required for unbonding
    height?: number,
  ): Promise<GlobalParamsVersion> => {
    if (!btcWallet) {
      throw new Error("Wallet is not loaded");
    }
    const globalParamsData = await getGlobalParams();

    let currentBtcHeight;
    if (!height) {
      try {
        currentBtcHeight = await btcWallet?.btcTipHeight();
      } catch (error: Error | any) {
        throw new Error("Couldn't get current BTC height");
      }
    } else {
      currentBtcHeight = height;
    }

    const sorted = [...globalParamsData.data.versions].sort(
      (a, b) => b.activation_height - a.activation_height,
    );

    // if activation height is greater than current btc height, return the version
    const currentVersion = sorted.find(
      (version) => version.activation_height <= currentBtcHeight,
    );
    if (!currentVersion) {
      throw new Error("No current version found");
    } else {
      return currentVersion;
    }
  };

  const { data: globalParamsVersion } = useQuery({
    queryKey: ["global params"],
    queryFn: () => getCurrentGlobalParamsVersion(),
    refetchInterval: 60000, // 1 minute
    // Should be enabled only when the wallet is connected
    enabled: !!btcWallet,
  });

  const { data: finalityProvidersData } = useQuery({
    queryKey: ["finality providers"],
    queryFn: getFinalityProviders,
    refetchInterval: 60000, // 1 minute
    select: (data) => data.data,
  });

  // TODO pagination is not implemented at the moment
  const { data: delegationsData, fetchNextPage: _fetchNextDelegationsPage } =
    useInfiniteQuery({
      queryKey: ["delegations", address],
      queryFn: ({ pageParam = "" }) =>
        getDelegations(pageParam, publicKeyNoCoord),
      getNextPageParam: (lastPage) => lastPage?.pagination?.next_key,
      initialPageParam: "",
      refetchInterval: 60000, // 1 minute
      enabled: !!(btcWallet && publicKeyNoCoord && address),
      select: (data) => data?.pages?.flatMap((page) => page?.data),
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

  const handleConnectBTC = async () => {
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
    const found = finalityProvidersData.find((fp) => fp?.btc_pk === btcPkHex);
    if (found) {
      setFinalityProvider(found);
    }
  };

  const walletAndDataReady =
    !!btcWallet && !!globalParamsVersion && !!finalityProvidersData;

  const stakingFee = 500;
  const withdrawalFee = 500;
  const unbondingFee = 500;

  const handleSign = async () => {
    if (
      // Simple check, should be present in the form fields first
      !walletAndDataReady ||
      !finalityProvider ||
      !btcWalletNetwork
      // TODO implement checks
      // amount <= 0 ||
      // term <= 0 ||
      // amount > globalParamsData.max_staking_amount ||
      // amount < globalParamsData.min_staking_amount ||
      // term > globalParamsData.max_staking_time ||
      // term < globalParamsData.min_staking_time
    ) {
      return;
    }

    // Rounding the input since 0.0006 * 1e8 is is 59999.999
    // which won't be accepted by the mempool API
    const stakingAmount = Math.round(Number(amount) * 1e8);
    // TODO term in blocks for dev purposes. Revert to days * 24 * 6
    const stakingTerm = Number(term);
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
      stakingTx = await btcWallet.signPsbt(unsignedStakingTx.toHex());
    } catch (error: Error | any) {
      console.error(error?.message || "Staking transaction signing error");
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

  let totalStaked = 0;

  if (delegationsData) {
    totalStaked = delegationsData
      // using only active delegations
      .filter((delegation) => delegation?.state === DelegationState.ACTIVE)
      .reduce(
        (accumulator: number, item) => accumulator + item?.staking_value,
        0,
      );
  }

  return (
    <main
      className={`h-full min-h-svh w-full ${lightSelected ? "light" : "dark"}`}
    >
      <Header
        onConnect={handleConnectBTC}
        address={address}
        balance={btcWalletBalance}
      />
      <div className="container mx-auto flex justify-center p-6">
        <div className="container flex flex-col gap-6">
          {!btcWallet && <ConnectLarge onConnect={handleConnectBTC} />}
          <Stats data={statsData} isLoading={statsDataIsLoading} />
          {address && btcWalletBalance && (
            <Summary
              address={address}
              totalStaked={totalStaked}
              balance={btcWalletBalance}
            />
          )}
          {btcWallet &&
            delegationsData &&
            globalParamsVersion &&
            btcWalletNetwork &&
            publicKeyNoCoord &&
            finalityProvidersData &&
            finalityProvidersData.length > 0 &&
            finalityProvidersKV && (
              <>
                <Staking
                  amount={amount}
                  onAmountChange={setAmount}
                  term={term}
                  onTermChange={setTerm}
                  disabled={!btcWallet}
                  finalityProviders={finalityProvidersData}
                  selectedFinalityProvider={finalityProvider}
                  onFinalityProviderChange={handleChooseFinalityProvider}
                  onSign={handleSign}
                />
                <Delegations
                  finalityProvidersKV={finalityProvidersKV}
                  delegationsAPI={delegationsData}
                  delegationsLocalStorage={delegationsLocalStorage}
                  globalParamsVersion={globalParamsVersion}
                  publicKeyNoCoord={publicKeyNoCoord}
                  unbondingFee={unbondingFee}
                  withdrawalFee={withdrawalFee}
                  btcWalletNetwork={btcWalletNetwork}
                  address={address}
                  signPsbt={btcWallet.signPsbt}
                  pushTx={btcWallet.pushTx}
                />
              </>
            )}
          <div className="flex flex-col gap-6 lg:flex-row">
            <Stakers />
            <FinalityProviders
              data={finalityProvidersData}
              totalActiveTVL={statsData?.active_tvl}
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Home;

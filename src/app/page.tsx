"use client";

import { useEffect, useState } from "react";
import {
  StakingScriptData,
  initBTCCurve,
  stakingTransaction,
} from "btc-staking-ts";
import { useLocalStorage } from "usehooks-ts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

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
import { getGlobalParams } from "./api/getGlobalParams";
import { Delegation, getDelegations } from "./api/getDelegations";
import { Connect } from "./components/Connect/Connect";
import { Steps } from "./components/Steps/Steps";
import { Form } from "./components/Form/Form";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { Delegations } from "./components/Delegations/Delegations";
import { toLocalStorageDelegation } from "@/utils/local_storage/toLocalStorageDelegation";
import { Transaction, networks } from "bitcoinjs-lib";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [btcWallet, setBTCWallet] = useState<WalletProvider>();
  const [btcWalletBalance, setBTCWalletBalance] = useState(0);
  const [btcWalletNetwork, setBTCWalletNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [finalityProvider, setFinalityProvider] = useState<FinalityProvider>();

  const { data: globalParamsData } = useQuery({
    queryKey: ["getGlobalParams"],
    queryFn: getGlobalParams,
    refetchInterval: 60000, // 1 minute
    select: (data) => data.data,
  });

  const { data: finalityProvidersData } = useQuery({
    queryKey: ["getFinalityProviders"],
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
    !!btcWallet && !!globalParamsData && !!finalityProvidersData;

  const stakingFee = 500;
  const withdrawalFee = 500;
  const unbondingFee = 500;

  const handleSign = async () => {
    if (
      // Simple check, should be present in the form fields first
      !walletAndDataReady ||
      !finalityProvider ||
      !btcWalletNetwork
      // TODO uncomment
      // amount <= 0 ||
      // duration <= 0 ||
      // amount > globalParamsData.max_staking_amount ||
      // amount < globalParamsData.min_staking_amount ||
      // duration > globalParamsData.max_staking_time ||
      // duration < globalParamsData.min_staking_time
    ) {
      return;
    }

    const covenantPKsBuffer = globalParamsData.covenant_pks.map((pk) =>
      Buffer.from(pk, "hex"),
    );

    // Rounding the input since 0.0006 * 1e8 is is 59999.999
    // which won't be accepted by the mempool API
    const stakingAmount = Math.round(Number(amount) * 1e8);
    // TODO Duration in blocks for dev purposes. Revert to days * 24 * 6
    const stakingDuration = Number(duration);
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
    let stakingScriptData;
    try {
      stakingScriptData = new StakingScriptData(
        Buffer.from(publicKeyNoCoord, "hex"),
        [Buffer.from(finalityProvider.btc_pk, "hex")],
        covenantPKsBuffer,
        globalParamsData.covenant_quorum,
        stakingDuration,
        globalParamsData.unbonding_time,
        Buffer.from(globalParamsData.tag),
      );
      if (!stakingScriptData.validate()) {
        throw new Error("Invalid staking data");
      }
    } catch (error: Error | any) {
      console.error(error?.message || "Cannot build staking script data");
      return;
    }
    let scripts;
    try {
      scripts = stakingScriptData.buildScripts();
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
        stakingDuration,
      ),
      ...delegations,
    ]);

    // Clear the form
    setAmount(0);
    setDuration(0);
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

  return (
    <main className="container mx-auto flex h-full min-h-svh w-full justify-center p-4">
      <div className="container flex flex-col gap-4">
        <Connect
          onConnect={handleConnectBTC}
          address={address}
          balance={btcWalletBalance}
        />
        <Form
          amount={amount}
          onAmountChange={setAmount}
          duration={duration}
          onDurationChange={setDuration}
          disabled={!btcWallet}
          finalityProviders={finalityProvidersData}
          finalityProvider={finalityProvider}
          onFinalityProviderChange={handleChooseFinalityProvider}
          onSign={handleSign}
        />
        <Steps
          isWalletConnected={!!btcWallet}
          isAmountSet={amount > 0}
          isDurationSet={duration > 0}
          isFinalityProviderSet={!!finalityProvider}
        />
        {btcWallet &&
          delegationsData &&
          globalParamsData &&
          btcWalletNetwork &&
          publicKeyNoCoord &&
          finalityProvidersData &&
          finalityProvidersData.length > 0 &&
          finalityProvidersKV && (
            <Delegations
              finalityProvidersKV={finalityProvidersKV}
              delegationsAPI={delegationsData}
              delegationsLocalStorage={delegationsLocalStorage}
              globalParamsData={globalParamsData}
              publicKeyNoCoord={publicKeyNoCoord}
              unbondingFee={unbondingFee}
              withdrawalFee={withdrawalFee}
              btcWalletNetwork={btcWalletNetwork}
              address={address}
              signPsbt={btcWallet.signPsbt}
              pushTx={btcWallet.pushTx}
            />
          )}
      </div>
    </main>
  );
};

export default Home;

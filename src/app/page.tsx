"use client";

import { useEffect, useState } from "react";
import {
  StakingScriptData,
  initBTCCurve,
  stakingTransaction,
} from "btc-staking-ts";
import { useLocalStorage } from "usehooks-ts";

import {
  getWallet,
  toNetwork,
  isSupportedAddressType,
  isTaproot,
  getPublicKeyNoCoord,
} from "@/utils/wallet/index";
import { Connect } from "./components/Connect/Connect";
import { Steps } from "./components/Steps/Steps";
import { Form } from "./components/Form/Form";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { FinalityProvider, mockApiData } from "@/mock/data";
import { Delegations } from "./components/Delegations/Delegations";
import { LocalStorageDelegation } from "@/types/LocalStorageDelegation";
import { State } from "@/types/State";
import { toLocalStorageDelegation } from "@/utils/toLocalStorageDelegation";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [btcWallet, setBTCWallet] = useState<WalletProvider>();
  const [btcWalletBalance, setBTCWalletBalance] = useState(0);

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [finalityProvider, setFinalityProvider] = useState<FinalityProvider>();

  // Initializing btc curve is a required one-time operation
  useEffect(() => {
    initBTCCurve();
  }, []);

  // Local state for delegations
  const delegationsLocalStorageKey = address
    ? `bbn-staking-delegations-${address}`
    : "";

  const [delegationsLocalStorage, setDelegationsLocalStorage] = useLocalStorage<
    LocalStorageDelegation[]
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
      setBTCWallet(walletProvider);
      setBTCWalletBalance(balance);
      setAddress(address);
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

  const handleChooseFinalityProvider = (btcPkHex: string) => {
    const finalityProviderFromMock = mockApiData.finality_providers.find(
      (fp) => fp.btc_pk === btcPkHex,
    );
    if (finalityProviderFromMock) {
      setFinalityProvider(finalityProviderFromMock);
    }
  };

  const handleSign = async () => {
    if (!btcWallet || !finalityProvider || !amount || !duration) {
      return;
    }

    const stakingFee = 500;

    const publicKeyNoCoord = getPublicKeyNoCoord(
      await btcWallet.getPublicKeyHex(),
    );

    const covenantPKsBuffer = mockApiData.covenant_pks.map((pk) =>
      Buffer.from(pk, "hex"),
    );

    // Rounding the input since 0.0006 * 1e8 is is 59999.999
    // which won't be accepted by the mempool API
    const stakingAmount = Math.round(Number(amount) * 1e8);
    const stakingDuration = Number(duration) * 24 * 6;
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
    let stakingScriptData = null;
    try {
      stakingScriptData = new StakingScriptData(
        publicKeyNoCoord,
        [Buffer.from(finalityProvider.btc_pk, "hex")],
        covenantPKsBuffer,
        mockApiData.covenant_quorum,
        stakingDuration,
        mockApiData.unbonding_time + 1,
        Buffer.from(mockApiData.tag),
      );
      if (!stakingScriptData.validate()) {
        throw new Error("Invalid staking data");
      }
    } catch (error: Error | any) {
      console.error(error?.message || "Cannot build staking script data");
      return;
    }
    let scripts = null;
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
    let unsignedStakingTx = null;
    try {
      unsignedStakingTx = stakingTransaction(
        timelockScript,
        unbondingScript,
        slashingScript,
        stakingAmount,
        stakingFee,
        address,
        inputUTXOs,
        toNetwork(await btcWallet.getNetwork()),
        isTaproot(address) ? publicKeyNoCoord : undefined,
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

    let txID = "";
    try {
      txID = await btcWallet.pushTx(stakingTx);
    } catch (error: Error | any) {
      console.error(error?.message || "Broadcasting staking transaction error");
    }

    // Update the local state with the new delegation
    setDelegationsLocalStorage((delegations) =>
      [
        ...delegations,
        toLocalStorageDelegation(
          amount,
          duration,
          finalityProvider.description.moniker,
          stakingTx,
          txID,
          State.active,
          Math.floor(Date.now() / 1000),
        ),
      ].sort((a, b) => b.inception - a.inception),
    );

    // Clear the form
    setAmount(0);
    setDuration(0);
    setFinalityProvider(undefined);
  };

  return (
    <main className="container mx-auto flex h-full min-h-svh w-full justify-center p-4">
      <div className="container flex flex-col gap-4">
        <Connect
          onConnect={handleConnectBTC}
          address={address}
          btcWalletBalance={btcWalletBalance}
        />
        <Form
          amount={amount}
          onAmountChange={setAmount}
          duration={duration}
          onDurationChange={setDuration}
          enabled={!!btcWallet}
          finalityProviders={mockApiData.finality_providers}
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
        {delegationsLocalStorage?.length > 0 && (
          <Delegations data={delegationsLocalStorage} />
        )}
      </div>
    </main>
  );
};

export default Home;

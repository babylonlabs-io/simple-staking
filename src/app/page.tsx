"use client";

import { useEffect, useState } from "react";

import { OKXWalletInfo, connectOKXWallet } from "@/utils/okx_wallet";
import { Connect } from "./components/Connect/Connect";
import { Steps } from "./components/Steps/Steps";
import { Form } from "./components/Form/Form";
import { Transaction } from "./components/Transaction/Transaction";
import {
  FinalityProvider,
  data as finalityProvidersMock,
} from "@/mock/finality_providers";
import {
  BtcStakingParams,
  data as btcStakingParamsMock,
} from "@/mock/btc_staking_params";
import * as btcstaking from "@/utils/btcstaking";
import * as mempoolApi from "@/utils/mempool_api";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [btcWallet, setBTCWallet] = useState<OKXWalletInfo>();
  const [btcWalletBalance, setBTCWalletBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [finalityProvider, setFinalityProvider] = useState<FinalityProvider>();
  const [stakingTx, setStakingTx] = useState("");
  const [mempoolTxID, setMempoolTxID] = useState("");

  const handleConnectBTC = async () => {
    try {
      const wallet = await connectOKXWallet();
      const balance = await wallet.getBalance();
      setBTCWallet(wallet);
      setBTCWalletBalance(balance);
    } catch (error: Error | any) {
      console.error(error?.message || error);
    }
  };

  const handleChooseFinalityProvider = (btcPkHex: string) => {
    const finalityProviderFromMock = finalityProvidersMock.find(
      (fp) => fp.btc_pk_hex === btcPkHex,
    );
    if (finalityProviderFromMock) {
      setFinalityProvider(finalityProviderFromMock);
    }
  };

  const handleSign = async () => {
    if (!btcWallet || !finalityProvider || !amount || !duration) {
      return;
    }

    // Reset the Transaction component
    setStakingTx("");
    setMempoolTxID("");

    const stakingFee = 500;

    const covenantPKsBuffer = btcStakingParamsMock.covenant_pks.map((pk) =>
      Buffer.from(pk, "hex"),
    );

    // Rounding the input since 0.0006 * 1e8 is is 59999.999
    // which won't be accepted by the mempool API
    const stakingAmount = Math.round(Number(amount) * 1e8);
    const stakingDuration = Number(duration) * 24 * 6;
    let inputUTXOs = [];
    try {
      inputUTXOs = await mempoolApi.getFundingUTXOs(
        btcWallet.address,
        stakingAmount + stakingFee,
      );
    } catch (error: Error | any) {
      console.log(error?.message || "UTXOs error");
      return;
    }
    if (inputUTXOs.length == 0) {
      console.log("Confirmed UTXOs not enough");
      return;
    }
    let stakingScriptData = null;
    try {
      stakingScriptData = new btcstaking.StakingScriptData(
        btcWallet.publicKeyNoCoord(),
        [Buffer.from(finalityProvider.btc_pk_hex, "hex")],
        covenantPKsBuffer,
        btcStakingParamsMock.covenant_quorum,
        stakingDuration,
        btcStakingParamsMock.min_unbonding_time + 1,
      );
      if (!stakingScriptData.validate()) {
        throw new Error("Invalid staking data");
      }
    } catch (error: Error | any) {
      console.log(error?.message || "Cannot build staking script data");
      return;
    }
    let scripts = null;
    try {
      scripts = stakingScriptData.buildScripts();
    } catch (error: Error | any) {
      console.log(error?.message || "Cannot build staking scripts");
      return;
    }
    const timelockScript = scripts.timelockScript;
    const unbondingScript = scripts.unbondingScript;
    const slashingScript = scripts.slashingScript;
    // const unbondingTimelockScript = scripts.unbondingTimelockScript;
    let unsignedStakingTx = null;
    try {
      unsignedStakingTx = btcstaking.stakingTransaction(
        timelockScript,
        unbondingScript,
        slashingScript,
        stakingAmount,
        stakingFee,
        btcWallet.address,
        inputUTXOs,
        btcWallet.btclibNetwork(),
        btcWallet.isTaproot ? btcWallet.publicKeyNoCoord() : undefined,
      );
    } catch (error: Error | any) {
      console.log(
        error?.message || "Cannot build unsigned staking transaction",
      );
      return;
    }
    let stakingTx = null;
    try {
      stakingTx = await btcWallet.signTransaction(unsignedStakingTx);
    } catch (error: Error | any) {
      console.log(error?.message || "Staking transaction signing error");
      return;
    }
    setStakingTx(stakingTx.toHex());

    let txID = "";
    try {
      txID = await mempoolApi.broadcastTransaction(stakingTx.toHex());
    } catch (error: Error | any) {
      console.log(error?.message || "Broadcasting staking transaction error");
    }
    setMempoolTxID(txID);
  };

  useEffect(() => {
    btcstaking.initBTCCurve();
  }, []);

  return (
    <main className="container mx-auto flex h-full min-h-svh w-full justify-center p-4">
      <div className="container flex flex-col gap-4">
        <Connect
          onConnect={handleConnectBTC}
          wallet={btcWallet}
          btcWalletBalance={btcWalletBalance}
        />
        <Form
          amount={amount}
          onAmountChange={setAmount}
          duration={duration}
          onDurationChange={setDuration}
          enabled={!!btcWallet}
          finalityProviders={finalityProvidersMock}
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
        {stakingTx && (
          <Transaction stakingTx={stakingTx} mempoolTxID={mempoolTxID} />
        )}
      </div>
    </main>
  );
};

export default Home;

"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
// import { makeSignDoc } from "@cosmjs/amino";
import { toUtf8 } from "@cosmjs/encoding";
import { useEffect, useState } from "react";

import { StakingForm } from "@/app/components/Staking/StakingForm";
import { BBN_REGISTRY_TYPE_URLS } from "@/utils/wallet/bbnRegistry";

import { Banner } from "./components/Banner/Banner";
import { Container } from "./components/Container/Container";
import { Activity } from "./components/Delegations/Activity";
import { FAQ } from "./components/FAQ/FAQ";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { Phase2HereModal } from "./components/Modals/Phase2Here";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { Stats } from "./components/Stats/Stats";
import { useBTCWallet } from "./context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "./context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "./hooks/client/rpc/mutation/useBbnTransaction";

const Home = () => {
  useEffect(() => {
    initBTCCurve();
  }, []);

  const [showPhase2HereModal, setShowPhase2HereModal] = useState(false);
  const { publicKeyNoCoord, getPublicKeyHex } = useBTCWallet();
  const { bech32Address } = useCosmosWallet();

  const { signingStargateClient } = useCosmosWallet();

  const { estimateBbnGasFee, sendBbnTx, signBbnTx } = useBbnTransaction();

  const printPK = async () => {
    console.log("PK", await getPublicKeyHex());
    console.log("PK no coord", publicKeyNoCoord);
    console.log("cosmos address", bech32Address);
  };

  // makeSignDoc();

  const sign = async () => {
    const signDoc = {
      account_number: "54545",
      chain_id: "bbn-test-5",
      fee: {
        gas: "279387",
        amount: [
          {
            amount: "1956",
            denom: "ubbn",
          },
        ],
      },
      memo: "",
      msgs: [
        {
          type: "/babylon.incentive.MsgWithdrawReward",
          value: {
            address: "bbn1dppj9xellvzrh7x60vft4u8cpkyrvv3camt8ps",
            type: "btc_delegation",
          },
        },
      ],
      sequence: "60",
    };

    const signOptions = {
      preferNoSetFee: false,
      preferNoSetMemo: true,
      disableBalanceCheck: true,
    };

    const { signed, signature } = await window.keplr.signAmino(
      "bbn-test-5",
      bech32Address,
      signDoc,
      signOptions,
    );
    console.log("signed", signed);
    console.log("signature", signature);

    // Build the legacy StdTx
    const stdTx = {
      msg: signed.msgs,
      fee: signed.fee,
      signatures: [
        {
          pub_key: signature.pub_key,
          signature: signature.signature,
        },
      ],
      memo: signed.memo,
    };

    const aminoTx = {
      type: "cosmos-sdk/StdTx",
      value: stdTx,
    };

    // // 2. The body for the legacy endpoint is { tx: <StdTx value>, mode: <"sync"|"async"|"block"> }
    // const broadcastBody = {
    //   tx: aminoTx.value,
    //   mode: "sync",
    // };

    // // 3. POST it to the old endpoint
    // const response = await fetch(
    //   "https://lcd-dapp.testnet.babylonlabs.io/txs",
    //   {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(broadcastBody),
    //   },
    // );

    // if (!response.ok) {
    //   const errorBody = await response.text();
    //   throw new Error(
    //     `Broadcast failed with HTTP status ${response.status}: ${errorBody}`,
    //   );
    // }

    // const result = await response.json();
    // console.log("Broadcast result:", result);
    // // Usually result includes things like { txhash, raw_log, ... }

    const aminoTxBytes = toUtf8(JSON.stringify(aminoTx));
    const aminoTxBuf = Buffer.from(JSON.stringify(aminoTx));

    // console.log("bin", bin);
    console.log("stdTx", stdTx);
    console.log("aminoTxBytes", aminoTxBytes);
    console.log("aminoTxBuf1", aminoTxBuf);

    try {
      // Send the transaction
      const txResponse = await window.keplr.sendTx(
        "bbn-test-5",
        aminoTxBytes,
        "sync",
      );
      console.log("Transaction response:", txResponse);
      const txHash = Buffer.from(txResponse, "hex");
      console.log("Transaction hash:", txHash);
    } catch (error: Error | any) {
      console.error("Failed to broadcast transaction:", error.message);
    }
  };

  const signAndBroadcast = async () => {
    // 2. Create and sign transaction
    const msgWithdrawReward = {
      typeUrl: BBN_REGISTRY_TYPE_URLS.MsgWithdrawReward,
      value: {
        address: "bbn1dppj9xellvzrh7x60vft4u8cpkyrvv3camt8ps",
        type: "btc_delegation",
      },
    };

    const raw = {
      account_number: "54545",
      chain_id: "bbn-test-5",
      fee: {
        gas: "1794467",
        amount: [
          {
            amount: "12562",
            denom: "ubbn",
          },
        ],
      },
      memo: "",
      msgs: [
        {
          type: "/babylon.btcstaking.v1.MsgCreateBTCDelegation",
          value: {
            btc_pk:
              "3f8f4496a7367a7c3fe78f95c084578b228e20325697cfe423936b905f7ac062",
            delegator_slashing_sig:
              "77415ee32a8d0802af962d0581ae4bbbd15b4e632ab56d77fe7026d1837c034c419f82e6c7c9b546a36e54650241ce725d3fc9373b359b723f72e00185e71852",
            delegator_unbonding_slashing_sig:
              "9ef2066bacb62b0e9b3bebf8459b78e906b2d08187a813abdfee0a487bc4ed917e5215c0f91866a3e281645a9cfdc315166b94158755b213fcaac8a732b026dc",
            fp_btc_pk_list: [
              "d23c2c25e1fcf8fd1c21b9a402c19e2e309e531e45e92fb1e9805b6056b0cc76",
            ],
            pop: {
              btc_sig:
                "1fd2fea706e826551975759b4fa6737ddf795a8332a9e21d00868ce468b1400a065f51a046f8c0337219fceeaed875723c810685eef2b63ac075675e1cc3874469",
              btc_sig_type: "2",
            },
            slashing_tx:
              "020000000103d1f71ddc7f8f0a938e5b1e3ce8804bf66dcc93fb733b4c5828311d112304e00000000000ffffffff02c4090000000000001600145be12624d08a2b424095d7c07221c33450d14bf11ca2000000000000225120ba2777d69c49a2eb24c4f23a2547ed6eaf94d38a641b3c677b887c04300a865b00000000",
            staker_addr: "bbn1dppj9xellvzrh7x60vft4u8cpkyrvv3camt8ps",
            staking_time: "64000",
            staking_tx:
              "02000000013ba432937ec749ac850615cbb353503cbf76dbef475c5201e042be46edc5923a0100000000ffffffff0250c3000000000000225120564287a433e16dd90a631d1f1e6bfa955841509e5ba1d35ddfe539e1b63d72f681fe890000000000225120b1382c55cafb8d6c7cbf64be5991550b78641e779259ec87b3a0fd680936269100000000",
            staking_value: "50000",
            unbonding_slashing_tx:
              "020000000119bb067dd1d185253eb54b13e9197f6cda400f2baaa83e39d2d2be1ecbae97540000000000ffffffff0260090000000000001600145be12624d08a2b424095d7c07221c33450d14bf1b09a000000000000225120ba2777d69c49a2eb24c4f23a2547ed6eaf94d38a641b3c677b887c04300a865b00000000",
            unbonding_time: "1008",
            unbonding_tx:
              "020000000103d1f71ddc7f8f0a938e5b1e3ce8804bf66dcc93fb733b4c5828311d112304e00000000000ffffffff0180bb0000000000002251209c58a550b316949581396e2eb596661509f99fe9f1e92c4553fdae358078eba900000000",
            unbonding_value: "48000",
          },
        },
      ],
      sequence: "70",
    };

    const item = raw.msgs[0].value;

    const msgCreateBTC = {
      typeUrl: BBN_REGISTRY_TYPE_URLS.MsgCreateBTCDelegation,
      value: {
        stakerAddr: item.staker_addr,
        pop: {
          btcSigType: item.pop.btc_sig_type,
          btcSig: Buffer.from(item.pop.btc_sig, "hex"),
        },
        btcPk: Buffer.from(item.btc_pk, "hex"),
        fpBtcPkList: [Buffer.from(item.fp_btc_pk_list[0], "hex")],
        stakingTime: parseInt(item.staking_time, 10),
        stakingValue: parseInt(item.staking_value, 10),
        stakingTx: Buffer.from(item.staking_tx, "hex"),
        stakingTxInclusionProof: null,
        slashingTx: Buffer.from(item.slashing_tx, "hex"),
        delegatorSlashingSig: Buffer.from(item.delegator_slashing_sig, "hex"),
        unbondingTime: parseInt(item.unbonding_time, 10),
        unbondingTx: Buffer.from(item.unbonding_tx, "hex"),
        unbondingValue: parseInt(item.unbonding_value, 10),
        unbondingSlashingTx: Buffer.from(item.unbonding_slashing_tx, "hex"),
        delegatorUnbondingSlashingSig: Buffer.from(
          item.delegator_unbonding_slashing_sig,
          "hex",
        ),
      },
    };

    // 3. Sign and broadcast
    try {
      // const fee = await estimateBbnGasFee(msgCreateBTC);
      // console.log("fee", fee);
      const signedTx = await signBbnTx(msgWithdrawReward);
      console.log("signedTx", signedTx);
      const response = await sendBbnTx(signedTx);
      console.log("response", response);
      // const response = await signingStargateClient!.signAndBroadcast(
      //   bech32Address,
      //   [msg],
      //   {
      //     amount: [{ amount: "1000", denom: "ubbn" }],
      //     gas: "205000",
      //   },
      //   "",
      // );
      // console.log("response", response);
    } catch (error: any) {
      console.error("Failed to brdcst:", error.message);
      console.log("error", error);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button onClick={printPK} className="border border-red-500">
          print pk
        </button>
        <button onClick={sign} className="border border-red-500">
          sign
        </button>
        <button onClick={signAndBroadcast} className="border border-red-500">
          sign and broadcast
        </button>
      </div>
      <Banner />
      <Header />

      <Container
        as="main"
        className="-mt-[10rem] md:-mt-[6.5rem] flex flex-col gap-12 md:gap-16 pb-16"
      >
        <Stats />
        <PersonalBalance />
        <StakingForm />
        <Activity />
        <FAQ />
      </Container>

      <Footer />
      <Phase2HereModal
        open={showPhase2HereModal}
        onClose={() => setShowPhase2HereModal(false)}
      />
    </>
  );
};

export default Home;

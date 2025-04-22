import { Client, decode, Wallet, xrpToDrops } from "xrpl";

export const MINIMUM_XRP_STAKE_FEE = 1000;

export const executeXrplStaking = async (
  amount: string,
  xrpPublicClient: Client | null,
  mnemonic: string,
) => {
  try {
    if (!xrpPublicClient) return "";

    const wallet = Wallet.fromMnemonic(mnemonic);
    const res = await fetch(
      `https://api.doppler.finance/v1/xrpfi/staking-info/user/${wallet.address}`,
    );
    const dopler = await res.json();
    const depositDestinationTag = dopler[0].depositDestinationTag;
    console.log("depositDestinationTag", depositDestinationTag);
    const preparedTx = await xrpPublicClient.autofill({
      TransactionType: "Payment",
      Account: wallet.address,
      Amount: xrpToDrops(amount),
      Destination: "rEPQxsSVER2r4HeVR4APrVCB45K68rqgp2",
      DestinationTag: depositDestinationTag,
    });
    // 서명 및 제출
    console.log("preparedTx", preparedTx);
    const signed = wallet.sign(preparedTx);
    const txResult = await xrpPublicClient.submitAndWait(signed.tx_blob);
    return txResult.result.hash;
  } catch (e) {
    console.log("error", e);
    return "";
  }
};

export const executeXrplUnstaking = async (
  amount: string,
  xrpPublicClient: Client | null,
  mnemonic: string,
) => {
  try {
    if (!xrpPublicClient) return "";

    const wallet = Wallet.fromMnemonic(mnemonic);
    const sequenceRequest = await xrpPublicClient.request({
      command: "account_info",
      account: wallet.address,
      ledger_index: "current",
    });

    const sequence = sequenceRequest.result.account_data.Sequence;
    const feeRequest = await xrpPublicClient.request({
      command: "fee",
    });

    const fee = feeRequest.result.drops.minimum_fee;

    const signed = wallet.sign({
      TransactionType: "Payment",
      Account: "rEPQxsSVER2r4HeVR4APrVCB45K68rqgp2",
      Amount: "0",
      Destination: wallet.address,
      Fee: fee,
      Sequence: sequence,
      Memos: [{ Memo: { MemoData: stringToHex(xrpToDrops(amount)) } }],
    });
    const decodedSigned = decode(signed.tx_blob);
    console.log("signed", decodedSigned);
    const withdrawRes = await fetch(
      "https://api.doppler.finance/v1/xrpfi/withdraw",
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(createDoplerTxInput(decodedSigned)),
      },
    );
    const jsonWithdrawRes = await withdrawRes.json();
    console.log("jsonWithdrawRes", jsonWithdrawRes);
  } catch (e) {
    console.log("error", e);
    return "";
  }
};

const stringToHex = (str: string): string => {
  return [...str]
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
};

const createDoplerTxInput = (input: Record<string, unknown>) => {
  const {
    TransactionType,
    Account,
    Destination,
    Amount,
    Sequence,
    Fee,
    SigningPubKey,
    TxnSignature,
    Memos,
  } = input;

  const tx: any = {
    Account,
    Amount,
    Destination,
    Sequence,
    SigningPubKey,
    TxnSignature,
    TransactionType,
    Fee,
    Memos: [...(Memos as any[])],
  };

  return tx;
};

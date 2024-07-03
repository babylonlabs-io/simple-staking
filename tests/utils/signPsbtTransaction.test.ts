import { Transaction } from "bitcoinjs-lib";
import { initBTCCurve } from "btc-staking-ts";

import { signPsbtTransaction } from "@/app/common/utils/psbt";
import { WalletProvider } from "@/utils/wallet/wallet_provider";

import { testingNetworks } from "../helper";

describe("signPsbtTransaction", () => {
  initBTCCurve();
  const { dataGenerator } = testingNetworks[0];
  const btcWallet = {
    signPsbt: jest.fn(),
    getWalletProviderName: jest.fn(),
    pushTx: jest.fn().mockResolvedValue(true),
  } as unknown as WalletProvider;

  it("should return a signed transaction for compatible wallets", async () => {
    const { unsignedPsbtHex, signedPsbtHex } =
      dataGenerator.generateRandomPsbtHex();

    (btcWallet.getWalletProviderName as jest.Mock).mockResolvedValue(
      "BTCWallet",
    );

    (btcWallet.signPsbt as jest.Mock).mockResolvedValue(signedPsbtHex);

    const signTransaction = signPsbtTransaction(btcWallet);

    const result = await signTransaction(unsignedPsbtHex);

    expect(btcWallet.signPsbt).toHaveBeenCalledWith(unsignedPsbtHex);

    expect(btcWallet.getWalletProviderName).toHaveBeenCalled();

    expect(result).toBeInstanceOf(Transaction);
  });

  it("should return a signed transaction for non-compatible wallets", async () => {
    const { unsignedPsbtHex, signedPsbtHex } =
      dataGenerator.generateRandomPsbtHex();

    (btcWallet.getWalletProviderName as jest.Mock).mockResolvedValue("OneKey");

    (btcWallet.signPsbt as jest.Mock).mockResolvedValue(signedPsbtHex);

    const signTransaction = signPsbtTransaction(btcWallet);

    const result = await signTransaction(unsignedPsbtHex);

    expect(btcWallet.signPsbt).toHaveBeenCalledWith(unsignedPsbtHex);

    expect(btcWallet.getWalletProviderName).toHaveBeenCalled();

    expect(result).toBeInstanceOf(Transaction);
  });
});

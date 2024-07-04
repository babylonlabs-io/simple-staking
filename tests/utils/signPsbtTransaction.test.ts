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
    const randomGlobalParamsVersions =
      dataGenerator.generateGlobalPramsVersions(
        dataGenerator.getRandomIntegerBetween(1, 20),
      );
    const stakerKeys = dataGenerator.generateRandomKeyPair();
    const randomStakingTxHeight =
      randomGlobalParamsVersions[
        dataGenerator.getRandomIntegerBetween(
          0,
          randomGlobalParamsVersions.length - 1,
        )
      ].activationHeight + 1;

    const { unsignedStakingPsbtHex, signedStakingPsbtHex } =
      dataGenerator.generateRandomPsbtHex(
        randomGlobalParamsVersions,
        randomStakingTxHeight,
        stakerKeys,
        false,
      );

    (btcWallet.getWalletProviderName as jest.Mock).mockResolvedValue(
      dataGenerator.generateRandomString(10),
    );

    (btcWallet.signPsbt as jest.Mock).mockResolvedValue(signedStakingPsbtHex);

    const signTransaction = signPsbtTransaction(btcWallet);

    const result = await signTransaction(unsignedStakingPsbtHex);

    expect(btcWallet.signPsbt).toHaveBeenCalledWith(unsignedStakingPsbtHex);

    expect(btcWallet.getWalletProviderName).toHaveBeenCalled();

    expect(result).toBeInstanceOf(Transaction);
  });

  it("should return a signed transaction for non-compatible wallets", async () => {
    const randomGlobalParamsVersions =
      dataGenerator.generateGlobalPramsVersions(
        dataGenerator.getRandomIntegerBetween(1, 20),
      );
    const stakerKeys = dataGenerator.generateRandomKeyPair();
    const randomStakingTxHeight =
      randomGlobalParamsVersions[
        dataGenerator.getRandomIntegerBetween(
          0,
          randomGlobalParamsVersions.length - 1,
        )
      ].activationHeight + 1;

    const { unsignedStakingPsbtHex, signedStakingPsbtHex } =
      dataGenerator.generateRandomPsbtHex(
        randomGlobalParamsVersions,
        randomStakingTxHeight,
        stakerKeys,
        true,
      );

    (btcWallet.getWalletProviderName as jest.Mock).mockResolvedValue("OneKey");

    (btcWallet.signPsbt as jest.Mock).mockResolvedValue(signedStakingPsbtHex);

    const signTransaction = signPsbtTransaction(btcWallet);

    const result = await signTransaction(unsignedStakingPsbtHex);

    expect(btcWallet.signPsbt).toHaveBeenCalledWith(unsignedStakingPsbtHex);

    expect(btcWallet.getWalletProviderName).toHaveBeenCalled();

    expect(result).toBeInstanceOf(Transaction);
  });
});

import { Psbt, Transaction } from "bitcoinjs-lib";

import { signPsbtTransaction } from "@/app/common/utils/psbt";

// Mock the WalletProvider
const mockWalletProvider = (providerName: string, signedHex: string) => ({
  signPsbt: jest.fn().mockResolvedValue(signedHex),
  getWalletProviderName: jest.fn().mockResolvedValue(providerName),
});

const mocked_signedTxHexPair = {
  psbtHex:
    "70736274ff0100db0200000001103eee601ed9524da7b94953d17ac95cae07540ee4b5fd944669de461ee00c900200000000fdffffff033075000000000000225120b435cd0ce5f2b53a2bb3f0265af2c5240ea604988d7fba3bc4d43e3249641f730000000000000000496a476262643400392fc0de15a9a8cf5488235976bcecf5743ee0ef73f61d6068b2eb91c6449d317259aa77dcb96e09d5ae1204bc0648ce6160d8945db4ca12d883aac5e2042c1f00966cb6000000000000225120e2138f042b525186db6e22526f86de3d29d3ec9bff023f16e4827599f3596570d92003000001012ba72c010000000000225120e2138f042b525186db6e22526f86de3d29d3ec9bff023f16e4827599f3596570011720392fc0de15a9a8cf5488235976bcecf5743ee0ef73f61d6068b2eb91c6449d3100000000",
  signedTxHex:
    "02000000000101103eee601ed9524da7b94953d17ac95cae07540ee4b5fd944669de461ee00c900200000000fdffffff033075000000000000225120b435cd0ce5f2b53a2bb3f0265af2c5240ea604988d7fba3bc4d43e3249641f730000000000000000496a476262643400392fc0de15a9a8cf5488235976bcecf5743ee0ef73f61d6068b2eb91c6449d317259aa77dcb96e09d5ae1204bc0648ce6160d8945db4ca12d883aac5e2042c1f00966cb6000000000000225120e2138f042b525186db6e22526f86de3d29d3ec9bff023f16e4827599f359657001406ddb0bf6016660fa315584c32323119ec9788a5ef9a0c1ab6330f8105c9c1c2037ec367f2f376d5e0760bcdc9b74d65b80404074860e37bdd1e983572dff3207d9200300",
};
const mocked_signedPsbtHexPair = {
  psbtHex:
    "70736274ff0100cf0200000001f5c333aef0e41a646c22953109cb22936386d0b4c6ae4806a65044ffb4333c140200000000fdffffff0330750000000000002251205c3c9613d7c8e1069962e48df5df6b39f5ff799a077f9818e403962951d327940000000000000000496a476262643400634d38e0306a1623db98da1e229eed182b0c61811bdcc26cba5c8373a5df84417259aa77dcb96e09d5ae1204bc0648ce6160d8945db4ca12d883aac5e2042c1f0096a1e63f01000000001600140a70b8068c6c24946a9e41c23e5bb4084f5266a0d92003000001011fe65c4001000000001600140a70b8068c6c24946a9e41c23e5bb4084f5266a000000000",
  signedPsbtHex:
    "70736274ff0100cf0200000001f5c333aef0e41a646c22953109cb22936386d0b4c6ae4806a65044ffb4333c140200000000fdffffff0330750000000000002251205c3c9613d7c8e1069962e48df5df6b39f5ff799a077f9818e403962951d327940000000000000000496a476262643400634d38e0306a1623db98da1e229eed182b0c61811bdcc26cba5c8373a5df84417259aa77dcb96e09d5ae1204bc0648ce6160d8945db4ca12d883aac5e2042c1f0096a1e63f01000000001600140a70b8068c6c24946a9e41c23e5bb4084f5266a0d92003000001011fe65c4001000000001600140a70b8068c6c24946a9e41c23e5bb4084f5266a001086b0247304402207b7b53b01ee71512444ebf22af6e0ef45a9c897e3ddb7e895f70815a738fc38502206a658fd7f358c09a46e51f326871191fb27df1e41186bfbff486a441269c659d012103634d38e0306a1623db98da1e229eed182b0c61811bdcc26cba5c8373a5df844100000000",
};

describe("signPsbtTransaction", () => {
  it("should handle compatible wallets correctly", async () => {
    const mockProviderName = "OKX";

    const wallet = mockWalletProvider(
      mockProviderName,
      mocked_signedPsbtHexPair.signedPsbtHex,
    ) as any;
    const signTransaction = signPsbtTransaction(wallet);

    const result = await signTransaction(mocked_signedPsbtHexPair.psbtHex);

    expect(wallet.getWalletProviderName).toHaveBeenCalled();
    expect(result.toHex()).toBe(
      Psbt.fromHex(mocked_signedPsbtHexPair.signedPsbtHex)
        .extractTransaction()
        .toHex(),
    );
  });

  it("should handle non-compatible wallets with new implementation", async () => {
    const mockProviderName = "OneKey";

    const wallet = mockWalletProvider(
      mockProviderName,
      mocked_signedPsbtHexPair.signedPsbtHex,
    ) as any;
    const signTransaction = signPsbtTransaction(wallet);

    const result = await signTransaction(mocked_signedPsbtHexPair.psbtHex);

    expect(wallet.getWalletProviderName).toHaveBeenCalled();
    expect(result.toHex()).toBe(
      Psbt.fromHex(mocked_signedPsbtHexPair.signedPsbtHex)
        .extractTransaction()
        .toHex(),
    );
  });

  it("should handle non-compatible wallets with old implementation", async () => {
    const mockProviderName = "OneKey";

    const wallet = mockWalletProvider(
      mockProviderName,
      mocked_signedTxHexPair.signedTxHex,
    ) as any;
    const signTransaction = signPsbtTransaction(wallet);

    const result = await signTransaction(mocked_signedTxHexPair.psbtHex);

    expect(wallet.getWalletProviderName).toHaveBeenCalled();
    expect(result.toHex()).toBe(
      Transaction.fromHex(mocked_signedTxHexPair.signedTxHex).toHex(),
    );
  });
});

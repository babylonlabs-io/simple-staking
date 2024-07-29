import { postVerifyUtxoOrdinals } from "@/app/api/postFilterOrdinals";
import { filterOrdinals } from "@/utils/utxo";
import { Inscription, UTXO } from "@/utils/wallet/wallet_provider";

// Mock the dependencies
jest.mock("@/app/api/postFilterOrdinals");

describe("filterOrdinals", () => {
  const mockUtxos: UTXO[] = [
    { txid: "txid1", vout: 0, value: 1000, scriptPubKey: "scriptPubKey1" },
    { txid: "txid2", vout: 1, value: 2000, scriptPubKey: "scriptPubKey2" },
    { txid: "txid3", vout: 2, value: 3000, scriptPubKey: "scriptPub" },
  ];
  const address = "testAddress";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return an empty array when no UTXOs are provided", async () => {
    const result = await filterOrdinals([], address, jest.fn());
    expect(result).toEqual([]);
  });

  it("should filter out UTXOs that contain ordinals from the wallet", async () => {
    const mockInscriptions: Inscription[] = [{ output: "txid1:0" }];
    const getInscriptionsFromWalletCb = jest
      .fn()
      .mockResolvedValue(mockInscriptions);

    const result = await filterOrdinals(
      mockUtxos,
      address,
      getInscriptionsFromWalletCb,
    );

    expect(result).toEqual([mockUtxos[1], mockUtxos[2]]);
  });

  it("should fall back to API when wallet callback fails", async () => {
    const getInscriptionsFromWalletCb = jest
      .fn()
      .mockRejectedValue(new Error("wallet error"));

    (postVerifyUtxoOrdinals as jest.Mock).mockResolvedValue([
      { txid: "txid1", vout: 0, inscription: true },
      { txid: "txid2", vout: 1, inscription: false },
      { txid: "txid3", vout: 2, inscription: false },
    ]);

    const result = await filterOrdinals(
      mockUtxos,
      address,
      getInscriptionsFromWalletCb,
    );

    expect(result).toEqual([mockUtxos[1], mockUtxos[2]]);
  });

  it("should fall back to API when wallet callback is not implemented", async () => {
    (postVerifyUtxoOrdinals as jest.Mock).mockResolvedValue([
      { txid: "txid1", vout: 0, inscription: true },
      { txid: "txid2", vout: 1, inscription: true },
      { txid: "txid3", vout: 2, inscription: false },
    ]);

    const result = await filterOrdinals(mockUtxos, address, undefined as any);

    expect(result).toEqual([mockUtxos[2]]);
  });

  it("should return original UTXOs if API call fails", async () => {
    const getInscriptionsFromWalletCb = jest
      .fn()
      .mockRejectedValue(new Error("wallet error"));

    (postVerifyUtxoOrdinals as jest.Mock).mockRejectedValue(
      new Error("api error"),
    );

    const result = await filterOrdinals(
      mockUtxos,
      address,
      getInscriptionsFromWalletCb,
    );

    expect(result).toEqual(mockUtxos);
  });
});

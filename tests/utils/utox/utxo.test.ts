import { postVerifyUtxoOrdinals } from "@/app/api/postFilterOrdinals";
import { filterOrdinals, WALLET_FETCH_INSRIPTIONS_TIMEOUT } from "@/utils/utxo";
import {
  InscriptionIdentifier,
  UTXO,
} from "@/utils/wallet/btc_wallet_provider";

// Mock the dependencies
jest.mock("@/app/api/postFilterOrdinals");

describe("filterOrdinals", () => {
  const mockUtxos: UTXO[] = [
    { txid: "txid1", vout: 0, value: 100000, scriptPubKey: "scriptPubKey1" },
    { txid: "txid2", vout: 1, value: 200000, scriptPubKey: "scriptPubKey2" },
    { txid: "txid3", vout: 2, value: 300000, scriptPubKey: "scriptPub" },
  ];
  const address = "testAddress";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return an empty array when no UTXOs are provided", async () => {
    const result = await filterOrdinals([], address, jest.fn());
    expect(result).toEqual([]);
  });

  it("should filter out UTXOs have less than 10k sats", async () => {
    const getInscriptionsFromWalletCb = jest.fn().mockResolvedValue([]);

    const mockedUTXOsWithLowValue = [
      { txid: "txid1", vout: 0, value: 10000, scriptPubKey: "scriptPubKey1" },
      { txid: "txid2", vout: 1, value: 9999, scriptPubKey: "scriptPubKey2" },
      { txid: "txid3", vout: 2, value: 10001, scriptPubKey: "scriptPub" },
    ];

    const result = await filterOrdinals(
      mockedUTXOsWithLowValue,
      address,
      getInscriptionsFromWalletCb,
    );

    expect(result).toEqual([mockedUTXOsWithLowValue[2]]);
  });

  it("should filter out UTXOs that contain ordinals from the wallet", async () => {
    const mockInscriptions: InscriptionIdentifier[] = [
      {
        txid: "txid1",
        vout: 0,
      },
    ];
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

  it("should filter UTXOs using the API fallback when wallet callback times out", async () => {
    const mockApiResponse = [
      { txid: "txid1", vout: 0, inscription: true },
      { txid: "txid2", vout: 1, inscription: false },
      { txid: "txid3", vout: 2, inscription: false },
    ];
    const getInscriptionsFromWalletCb = jest.fn().mockImplementation(() => {
      return new Promise((resolve) =>
        setTimeout(resolve, WALLET_FETCH_INSRIPTIONS_TIMEOUT + 1000),
      );
    });

    (postVerifyUtxoOrdinals as jest.Mock).mockResolvedValue(mockApiResponse);

    const result = await filterOrdinals(
      mockUtxos,
      address,
      getInscriptionsFromWalletCb,
    );

    expect(getInscriptionsFromWalletCb).toHaveBeenCalledTimes(1);
    expect(postVerifyUtxoOrdinals).toHaveBeenCalledWith(mockUtxos, address);
    expect(result).toEqual([mockUtxos[1], mockUtxos[2]]);
  });
});

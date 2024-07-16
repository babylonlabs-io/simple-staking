import { getFundingUTXOs } from "@/utils/mempool_api";
import { UTXO } from "@/utils/wallet/wallet_provider";

// Mocking fetch globally
global.fetch = jest.fn() as jest.Mock;

// Mocking getNetworkConfig to return a specific mempoolApiUrl
jest.mock("@/config/network.config", () => ({
  getNetworkConfig: jest.fn(() => ({
    mempoolApiUrl: "https://babylon.mempool.space",
  })),
}));

// Transaction with BRC20
const txIDWithBrc20 = "txWithBRC20";

jest.mock("@/app/api/postFilterOrdinals", () => ({
  postFilterOrdinals: async (utxos: UTXO[]): Promise<UTXO[]> => {
    // Simulated API response
    const apiResponse = [
      {
        txid: txIDWithBrc20,
        isBrc20: true,
      },
    ];

    // Filter out UTXOs based on the simulated API response
    const filteredUtxos = utxos.filter((utxo) => {
      const responseItem = apiResponse.find((item) => item.txid === utxo.txid);
      return responseItem ? !responseItem.isBrc20 : true;
    });

    return filteredUtxos;
  },
}));

describe("getFundingUTXOs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUTXOs = [
    {
      txid: "regular small utxo",
      vout: 0,
      status: {
        confirmed: true,
        block_height: 851843,
        block_hash:
          "000000000000000000010995e987a0e4e10420d84895ed555bad221a9686ca77",
        block_time: 1720789592,
      },
      value: 10000,
    },
    {
      txid: txIDWithBrc20,
      vout: 1,
      status: {
        confirmed: true,
        block_height: 851842,
        block_hash:
          "000000000000000000010995e987a0e4e10420d84895ed555bad221a9686ca66",
        block_time: 1720789492,
      },
      value: 150000,
    },
    {
      txid: "unconfirmed utxo",
      vout: 2,
      status: {
        confirmed: false,
        block_height: null,
        block_hash: null,
        block_time: null,
      },
      value: 200000,
    },
    {
      txid: "regular medium utxo",
      vout: 3,
      status: {
        confirmed: true,
        block_height: 851843,
        block_hash:
          "000000000000000000010995e987a0e4e10420d84895ed555bad221a9686ca77",
        block_time: 1720789592,
      },
      value: 150000,
    },
  ];

  const scriptPubKey = "76a9140bc07d0d879768d0b89f5f1226b7d7d1a4bc816388ac";
  const mockAddressInfo = {
    isvalid: true,
    scriptPubKey,
  };

  const mockInvalidAddressInfo = {
    isvalid: false,
    scriptPubKey: "",
  };

  it("should return UTXOs that satisfy the amount requirement, excluding BRC-20 ordinals", async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce((url: URL) => {
        if (
          url.href ===
          "https://babylon.mempool.space/api/address/testAddress/utxo"
        ) {
          return Promise.resolve({
            json: async () => mockUTXOs,
          });
        }
      })
      .mockImplementationOnce((url: URL) => {
        if (
          url.href ===
          "https://babylon.mempool.space/api/v1/validate-address/testAddress"
        ) {
          return Promise.resolve({
            json: async () => mockAddressInfo,
          });
        }
      });

    const result = await getFundingUTXOs("testAddress", 100000);

    expect(result).toEqual([
      {
        txid: "regular medium utxo",
        vout: 3,
        value: 150000,
        scriptPubKey,
      },
    ]);
  });

  it("should return all confirmed UTXOs if no amount is provided, excluding BRC-20 ordinals", async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce((url: URL) => {
        if (
          url.href ===
          "https://babylon.mempool.space/api/address/testAddress/utxo"
        ) {
          return Promise.resolve({
            json: async () => mockUTXOs,
          });
        }
      })
      .mockImplementationOnce((url: URL) => {
        if (
          url.href ===
          "https://babylon.mempool.space/api/v1/validate-address/testAddress"
        ) {
          return Promise.resolve({
            json: async () => mockAddressInfo,
          });
        }
      });

    const result = await getFundingUTXOs("testAddress");

    expect(result).toEqual([
      {
        txid: "regular medium utxo",
        vout: 3,
        value: 150000,
        scriptPubKey,
      },
      {
        txid: "regular small utxo",
        vout: 0,
        value: 10000,
        scriptPubKey,
      },
    ]);
  });

  it("should throw an error if address is invalid", async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce((url: URL) => {
        if (
          url.href ===
          "https://babylon.mempool.space/api/address/testAddress/utxo"
        ) {
          return Promise.resolve({
            json: async () => mockUTXOs,
          });
        }
      })
      .mockImplementationOnce((url: URL) => {
        if (
          url.href ===
          "https://babylon.mempool.space/api/v1/validate-address/testAddress"
        ) {
          return Promise.resolve({
            json: async () => mockInvalidAddressInfo,
          });
        }
      });

    await expect(getFundingUTXOs("testAddress", 100000)).rejects.toThrow(
      "Invalid address",
    );
  });

  it("should return an empty array if the amount cannot be satisfied", async () => {
    const insufficientUTXOs = [
      {
        txid: "abcdbe6b5362b71ae86f34750eee52d02eeda4268d999b0e7bc29f444c4b7d80",
        vout: 1,
        status: {
          confirmed: true,
          block_height: 851842,
          block_hash:
            "000000000000000000010995e987a0e4e10420d84895ed555bad221a9686ca66",
          block_time: 1720789492,
        },
        value: 50000,
      },
    ];

    (global.fetch as jest.Mock)
      .mockImplementationOnce((url: URL) => {
        if (
          url.href ===
          "https://babylon.mempool.space/api/address/testAddress/utxo"
        ) {
          return Promise.resolve({
            json: async () => insufficientUTXOs,
          });
        }
      })
      .mockImplementationOnce((url: URL) => {
        if (
          url.href ===
          "https://babylon.mempool.space/api/v1/validate-address/testAddress"
        ) {
          return Promise.resolve({
            json: async () => mockAddressInfo,
          });
        }
      });

    const result = await getFundingUTXOs("testAddress", 200000);

    expect(result).toEqual([]);
  });
});

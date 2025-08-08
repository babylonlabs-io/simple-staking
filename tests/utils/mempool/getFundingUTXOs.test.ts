import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { getUTXOs } from "@/ui/common/utils/mempool_api";

// Mocking fetch globally
global.fetch = jest.fn() as jest.Mock;

// Mocking getNetworkConfig to return a specific mempoolApiUrl
jest.mock("@/ui/common/config/network/btc", () => ({
  getNetworkConfigBTC: jest.fn(() => ({
    mempoolApiUrl: "https://mempool.space",
  })),
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

  it("should return all UTXOs", async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce((url: URL) => {
        if (url.href === "https://mempool.space/api/address/testAddress/utxo") {
          return Promise.resolve({
            ok: true,
            json: async () => mockUTXOs,
          });
        }
      })
      .mockImplementationOnce((url: URL) => {
        if (
          url.href ===
          "https://mempool.space/api/v1/validate-address/testAddress"
        ) {
          return Promise.resolve({
            ok: true,
            json: async () => mockAddressInfo,
          });
        }
      });

    const result = await getUTXOs("testAddress");

    expect(result).toEqual([
      {
        txid: "unconfirmed utxo",
        vout: 2,
        value: 200000,
        scriptPubKey,
        confirmed: false,
      },
      {
        txid: "regular medium utxo",
        vout: 3,
        value: 150000,
        scriptPubKey,
        confirmed: true,
      },
      {
        txid: "regular small utxo",
        vout: 0,
        value: 10000,
        scriptPubKey,
        confirmed: true,
      },
    ]);
  });

  it("should throw an error if address is invalid", async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce((url: URL) => {
        if (url.href === "https://mempool.space/api/address/testAddress/utxo") {
          return Promise.resolve({
            ok: true,
            json: async () => mockUTXOs,
          });
        }
      })
      .mockImplementationOnce((url: URL) => {
        if (
          url.href ===
          "https://mempool.space/api/v1/validate-address/testAddress"
        ) {
          return Promise.resolve({
            ok: true,
            json: async () => mockInvalidAddressInfo,
          });
        }
      });

    await expect(getUTXOs("testAddress")).rejects.toThrow(
      new ClientError(
        ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
        "Error getting UTXOs",
        {
          cause: new Error(
            "Invalid address provided for UTXO lookup or mempool API validation failed: testAddress",
          ),
        },
      ),
    );
  });
});

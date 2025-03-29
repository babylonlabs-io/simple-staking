import { ServerError } from "@/app/context/Error/errors";
import { getNetworkConfigBTC } from "@/config/network/btc";
import * as fetchModule from "@/utils/fetch";
import * as mempoolApiModule from "@/utils/mempool_api";

const { mempoolApiUrl } = getNetworkConfigBTC();

jest.mock("@/utils/fetch", () => {
  const originalModule = jest.requireActual("@/utils/fetch");
  return {
    ...originalModule,
    validateUrlPath: jest.fn((path) => {
      try {
        return originalModule.validateUrlPath(path);
      } catch (error) {
        throw error;
      }
    }),
    fetchApi: jest.fn().mockImplementation(() => Promise.resolve({})),
  };
});

describe("mempool_api URL construction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Integration with validateUrlPath", () => {
    it("should validate address in getAddressBalance", async () => {
      const mockAddress = "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4";

      (fetchModule.fetchApi as jest.Mock).mockResolvedValueOnce({
        chain_stats: {
          funded_txo_sum: 100,
          spent_txo_sum: 50,
        },
      });

      await mempoolApiModule.getAddressBalance(mockAddress);

      expect(fetchModule.validateUrlPath).toHaveBeenCalledWith(mockAddress);
    });

    it("should validate address in getUTXOs", async () => {
      const mockAddress = "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4";

      (fetchModule.fetchApi as jest.Mock).mockResolvedValueOnce([
        {
          txid: "abc123",
          vout: 0,
          value: 100,
          status: { confirmed: true },
        },
      ]);

      (fetchModule.fetchApi as jest.Mock).mockResolvedValueOnce({
        isvalid: true,
        scriptPubKey: "script123",
      });

      await mempoolApiModule.getUTXOs(mockAddress);

      expect(fetchModule.validateUrlPath).toHaveBeenCalledWith(mockAddress);
      expect(fetchModule.validateUrlPath).toHaveBeenCalledTimes(2);
    });

    it("should validate transaction ID in getTxInfo", async () => {
      const mockTxId =
        "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d";

      (fetchModule.fetchApi as jest.Mock).mockResolvedValueOnce({
        txid: mockTxId,
        version: 1,
        locktime: 0,
        vin: [],
        vout: [],
        size: 100,
        weight: 400,
        fee: 10,
        status: {
          confirmed: true,
          block_height: 100,
          block_hash: "hash123",
          block_time: 123456789,
        },
      });

      await mempoolApiModule.getTxInfo(mockTxId);

      expect(fetchModule.validateUrlPath).toHaveBeenCalledWith(mockTxId);
    });

    it("should validate transaction ID in getTxMerkleProof", async () => {
      const mockTxId =
        "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d";

      (fetchModule.fetchApi as jest.Mock).mockResolvedValueOnce({
        block_height: 100,
        merkle: ["hash1", "hash2"],
        pos: 1,
      });

      await mempoolApiModule.getTxMerkleProof(mockTxId);

      expect(fetchModule.validateUrlPath).toHaveBeenCalledWith(mockTxId);
    });

    it("should validate transaction ID in getTxHex", async () => {
      const mockTxId =
        "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d";

      (fetchModule.fetchApi as jest.Mock).mockResolvedValueOnce(
        "0123456789abcdef",
      );

      await mempoolApiModule.getTxHex(mockTxId);

      expect(fetchModule.validateUrlPath).toHaveBeenCalledWith(mockTxId);
    });
  });

  describe("Handling invalid inputs", () => {
    it("should throw ServerError for path traversal in address", async () => {
      const maliciousAddress = "../etc/passwd";

      // Mock validateUrlPath to throw error as it would with this input
      (fetchModule.validateUrlPath as jest.Mock).mockImplementationOnce(() => {
        throw new ServerError({
          message: "Invalid parameter: potential path traversal detected",
          status: 400,
          endpoint: "validateUrlPath",
        });
      });

      await expect(
        mempoolApiModule.getAddressBalance(maliciousAddress),
      ).rejects.toThrow(ServerError);
    });

    it("should throw ServerError for path traversal in transaction ID", async () => {
      const maliciousTxId = "abc/../def";

      (fetchModule.validateUrlPath as jest.Mock).mockImplementationOnce(() => {
        throw new ServerError({
          message: "Invalid parameter: potential path traversal detected",
          status: 400,
          endpoint: "validateUrlPath",
        });
      });

      await expect(mempoolApiModule.getTxInfo(maliciousTxId)).rejects.toThrow(
        ServerError,
      );
    });

    it("should throw ServerError for URL encoded path traversal in address", async () => {
      const maliciousAddress = "abc%2e%2edef";

      (fetchModule.validateUrlPath as jest.Mock).mockImplementationOnce(() => {
        throw new ServerError({
          message: "Invalid parameter: potential path traversal detected",
          status: 400,
          endpoint: "validateUrlPath",
        });
      });

      await expect(
        mempoolApiModule.getAddressBalance(maliciousAddress),
      ).rejects.toThrow(ServerError);
    });
  });
});

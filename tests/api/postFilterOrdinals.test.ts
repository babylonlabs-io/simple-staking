import { apiWrapper } from "@/app/api/apiWrapper";
import { postFilterOrdinals } from "@/app/api/postFilterOrdinals";
import { UTXO } from "@/utils/wallet/wallet_provider";

// Mock the apiWrapper function
jest.mock("@/app/api/apiWrapper");

describe("postFilterOrdinals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUTXOs: UTXO[] = [
    {
      txid: "inscription 0",
      vout: 0,
      value: 10000,
      scriptPubKey: "",
    },
    {
      txid: "normal 0",
      vout: 1,
      value: 15000,
      scriptPubKey: "",
    },
    {
      txid: "normal 1",
      vout: 2,
      value: 20000,
      scriptPubKey: "",
    },
    {
      txid: "inscription 1",
      vout: 3,
      value: 25000,
      scriptPubKey: "",
    },
    {
      txid: "normal 2",
      vout: 4,
      value: 30000,
      scriptPubKey: "",
    },
  ];

  const mockAddress =
    "bc1pu2e0cqgq7gdhdn8606jade6ug92gtnzmdwct0xu94jtrz62hl98s88akpq";

  const mockApiResponse = {
    data: [
      {
        txid: "inscription 0",
        vout: 0,
        inscription: true,
      },
      {
        txid: "normal 0",
        vout: 1,
        inscription: false,
      },
      {
        txid: "normal 1",
        vout: 2,
        inscription: false,
      },
      {
        txid: "inscription 1",
        vout: 3,
        inscription: true,
      },
      {
        txid: "normal 2",
        vout: 4,
        inscription: false,
      },
    ],
  };

  it("should filter out UTXOs with inscriptions", async () => {
    // Mock the API response
    (apiWrapper as jest.Mock).mockResolvedValueOnce({ data: mockApiResponse });

    const result = await postFilterOrdinals(mockUTXOs, mockAddress);

    expect(result).toEqual([
      {
        txid: "normal 0",
        value: 15000,
        vout: 1,
        scriptPubKey: "",
      },
      {
        txid: "normal 1",
        value: 20000,
        vout: 2,
        scriptPubKey: "",
      },
      {
        txid: "normal 2",
        value: 30000,
        vout: 4,
        scriptPubKey: "",
      },
    ]);
  });

  it("should return original UTXOs in case of an error", async () => {
    // Mock an API error
    (apiWrapper as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    const result = await postFilterOrdinals(mockUTXOs, mockAddress);

    expect(result).toEqual(mockUTXOs);
  });
});

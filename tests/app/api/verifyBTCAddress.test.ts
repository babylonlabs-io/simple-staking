import { apiWrapper } from "@/ui/common/api/apiWrapper";
import { verifyBTCAddress } from "@/ui/common/api/verifyBTCAddress";

// Mock the apiWrapper module
jest.mock("@/ui/common/api/apiWrapper");

describe("verifyBTCAddress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true when risk level is 'low'", async () => {
    // Mock the apiWrapper to return a 'low' risk response
    (apiWrapper as jest.Mock).mockResolvedValue({
      data: {
        data: {
          btc_address: {
            risk: "low",
          },
        },
      },
    });

    const result = await verifyBTCAddress("mockBtcAddress");

    // Verify apiWrapper was called with correct parameters
    expect(apiWrapper).toHaveBeenCalledWith(
      "GET",
      "/address/screening",
      "Error performing BTC address screening",
      { query: { btc_address: "mockBtcAddress" } },
    );

    // Verify the result is true
    expect(result).toBe(true);
  });

  it("returns true when risk level is 'medium'", async () => {
    // Mock the apiWrapper to return a 'medium' risk response
    (apiWrapper as jest.Mock).mockResolvedValue({
      data: {
        data: {
          btc_address: {
            risk: "medium",
          },
        },
      },
    });

    const result = await verifyBTCAddress("mockBtcAddress");

    // Verify the result is true
    expect(result).toBe(true);
  });

  it("returns true when risk level is in uppercase", async () => {
    // Mock the apiWrapper to return an uppercase risk response
    (apiWrapper as jest.Mock).mockResolvedValue({
      data: {
        data: {
          btc_address: {
            risk: "MEDIUM",
          },
        },
      },
    });

    const result = await verifyBTCAddress("mockBtcAddress");

    // Verify the result is true (case insensitive)
    expect(result).toBe(true);
  });

  it("returns false when risk level is 'high'", async () => {
    // Mock the apiWrapper to return a 'high' risk response
    (apiWrapper as jest.Mock).mockResolvedValue({
      data: {
        data: {
          btc_address: {
            risk: "high",
          },
        },
      },
    });

    const result = await verifyBTCAddress("mockBtcAddress");

    // Verify the result is false
    expect(result).toBe(false);
  });

  it("returns false when btc_address is missing in response", async () => {
    // Mock the apiWrapper to return a response without btc_address
    (apiWrapper as jest.Mock).mockResolvedValue({
      data: {
        data: {},
      },
    });

    const result = await verifyBTCAddress("mockBtcAddress");

    // Verify the result is false
    expect(result).toBe(false);
  });

  it("returns false when risk is missing in response", async () => {
    // Mock the apiWrapper to return a response without risk
    (apiWrapper as jest.Mock).mockResolvedValue({
      data: {
        data: {
          btc_address: {},
        },
      },
    });

    const result = await verifyBTCAddress("mockBtcAddress");

    // Verify the result is false
    expect(result).toBe(false);
  });

  it("returns false when apiWrapper throws an error", async () => {
    // Mock the apiWrapper to throw an error
    (apiWrapper as jest.Mock).mockRejectedValue(new Error("API error"));

    const result = await verifyBTCAddress("mockBtcAddress");

    // Verify the result is false
    expect(result).toBe(false);
  });
});

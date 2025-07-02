import { apiWrapper } from "@/ui/common/api/apiWrapper";
import {
  getDelegationV2,
  getDelegationsV2,
} from "@/ui/common/api/getDelegationsV2";
import { DelegationV2StakingState } from "@/ui/common/types/delegationsV2";

import {
  mockPaginatedResponse,
  mockSingleDelegationResponse,
} from "./getDelegationsV2.mocks";

// Mock the apiWrapper module
jest.mock("@/ui/common/api/apiWrapper");

describe("getDelegationsV2 API functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDelegationV2", () => {
    it("fetches a single delegation successfully", async () => {
      // Mock the apiWrapper to return the successful response
      (apiWrapper as jest.Mock).mockResolvedValue(mockSingleDelegationResponse);

      // Call the function
      const result = await getDelegationV2("mockTxHash123");

      // Verify apiWrapper was called with correct parameters
      expect(apiWrapper).toHaveBeenCalledWith(
        "GET",
        "/v2/delegation",
        "Error getting delegation v2",
        {
          query: {
            staking_tx_hash_hex: "mockTxHash123",
          },
        },
      );

      // Verify the result structure
      expect(result).toMatchObject({
        stakingTxHashHex: "mockTxHash123",
        stakingAmount: 1000000,
        state: DelegationV2StakingState.ACTIVE,
        finalityProviderBtcPksHex: ["pk1", "pk2"],
        stakingTimelock: 1440,
      });
    });

    it("returns null when there's an error", async () => {
      // Mock the apiWrapper to throw an error
      const mockError = new Error("API error");
      (apiWrapper as jest.Mock).mockRejectedValue(mockError);

      // Call the function
      const result = await getDelegationV2("mockTxHash123");

      // Verify result is null
      expect(result).toBeNull();
    });
  });

  describe("getDelegationsV2", () => {
    it("fetches paginated delegations successfully", async () => {
      // Mock the apiWrapper to return the successful response
      (apiWrapper as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      // Call the function
      const result = await getDelegationsV2({
        stakerPublicKey: "mockStakerPubKey",
      });

      // Verify apiWrapper was called with correct parameters
      expect(apiWrapper).toHaveBeenCalledWith(
        "GET",
        "/v2/delegations",
        "Error getting delegations v2",
        {
          query: {
            staker_pk_hex: "mockStakerPubKey",
            babylon_address: undefined,
            pagination_key: "",
          },
        },
      );

      // Check result structure
      expect(result).toHaveProperty("delegations");
      expect(result).toHaveProperty("pagination");
      expect(result.delegations).toHaveLength(2);
      expect(result.pagination).toEqual({
        next_key: "nextPageKey123",
      });

      // Check first delegation
      expect(result.delegations[0]).toMatchObject({
        stakingTxHashHex: "mockTxHash1",
        state: DelegationV2StakingState.ACTIVE,
        stakingAmount: 1000000,
      });

      // Check second delegation
      expect(result.delegations[1]).toMatchObject({
        stakingTxHashHex: "mockTxHash2",
        state: DelegationV2StakingState.TIMELOCK_UNBONDING,
        stakingAmount: 2000000,
        unbondingTimelock: 144,
        unbondingTxHex: "unbondingTxHex",
      });
    });

    it("handles custom parameters", async () => {
      // Mock the apiWrapper to return a minimal response
      (apiWrapper as jest.Mock).mockResolvedValue({
        data: {
          data: [],
          pagination: {
            next_key: "",
          },
        },
      });

      // Call the function with all parameters
      await getDelegationsV2({
        stakerPublicKey: "mockStakerPubKey",
        babylonAddress: "mockBabylonAddress",
        pageKey: "customPageKey",
      });

      // Verify apiWrapper was called with correct parameters
      expect(apiWrapper).toHaveBeenCalledWith(
        "GET",
        "/v2/delegations",
        "Error getting delegations v2",
        {
          query: {
            staker_pk_hex: "mockStakerPubKey",
            babylon_address: "mockBabylonAddress",
            pagination_key: "customPageKey",
          },
        },
      );
    });

    it("rethrows error from apiWrapper", async () => {
      // Mock the apiWrapper to throw an error
      const mockError = new Error("API error");
      (apiWrapper as jest.Mock).mockRejectedValue(mockError);

      // Verify error is rethrown
      await expect(
        getDelegationsV2({
          stakerPublicKey: "mockStakerPubKey",
        }),
      ).rejects.toThrow("API error");
    });
  });
});

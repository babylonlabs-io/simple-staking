import { apiWrapper } from "@/app/api/apiWrapper";
import { getDelegationV2, getDelegationsV2 } from "@/app/api/getDelegationsV2";
import { DelegationV2StakingState } from "@/app/types/delegationsV2";

// Mock the apiWrapper module
jest.mock("@/app/api/apiWrapper");

describe("getDelegationsV2 API functions", () => {
  // Create mock API responses
  const mockSingleDelegationResponse = {
    data: {
      data: {
        finality_provider_btc_pks_hex: ["pk1", "pk2"],
        params_version: 1,
        staker_btc_pk_hex: "stakerPk",
        state: "ACTIVE",
        delegation_staking: {
          staking_tx_hex: "txHex123",
          staking_tx_hash_hex: "mockTxHash123",
          staking_timelock: 1440,
          staking_amount: 1000000,
          start_height: 100000,
          end_height: 200000,
          bbn_inception_height: 50000,
          bbn_inception_time: "2023-01-01T00:00:00Z",
          slashing: {
            slashing_tx_hex: "",
            spending_height: 0,
          },
        },
        delegation_unbonding: {
          unbonding_timelock: 0,
          unbonding_tx: "",
          covenant_unbonding_signatures: [],
          slashing: {
            unbonding_slashing_tx_hex: "",
            spending_height: 0,
          },
        },
      },
    },
  };

  const mockPaginatedResponse = {
    data: {
      data: [
        {
          finality_provider_btc_pks_hex: ["pk1", "pk2"],
          params_version: 1,
          staker_btc_pk_hex: "stakerPk1",
          state: "ACTIVE",
          delegation_staking: {
            staking_tx_hex: "txHex1",
            staking_tx_hash_hex: "mockTxHash1",
            staking_timelock: 1440,
            staking_amount: 1000000,
            start_height: 100000,
            end_height: 200000,
            bbn_inception_height: 50000,
            bbn_inception_time: "2023-01-01T00:00:00Z",
            slashing: {
              slashing_tx_hex: "",
              spending_height: 0,
            },
          },
          delegation_unbonding: {
            unbonding_timelock: 0,
            unbonding_tx: "",
            covenant_unbonding_signatures: [],
            slashing: {
              unbonding_slashing_tx_hex: "",
              spending_height: 0,
            },
          },
        },
        {
          finality_provider_btc_pks_hex: ["pk3", "pk4"],
          params_version: 1,
          staker_btc_pk_hex: "stakerPk2",
          state: "TIMELOCK_UNBONDING",
          delegation_staking: {
            staking_tx_hex: "txHex2",
            staking_tx_hash_hex: "mockTxHash2",
            staking_timelock: 2880,
            staking_amount: 2000000,
            start_height: 110000,
            end_height: 210000,
            bbn_inception_height: 60000,
            bbn_inception_time: "2023-02-01T00:00:00Z",
            slashing: {
              slashing_tx_hex: "",
              spending_height: 0,
            },
          },
          delegation_unbonding: {
            unbonding_timelock: 144,
            unbonding_tx: "unbondingTxHex",
            covenant_unbonding_signatures: [
              {
                covenant_btc_pk_hex: "covenantPk",
                signature_hex: "sigHex",
              },
            ],
            slashing: {
              unbonding_slashing_tx_hex: "",
              spending_height: 0,
            },
          },
        },
      ],
      pagination: {
        next_key: "nextPageKey123",
      },
    },
  };

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

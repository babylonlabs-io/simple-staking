import { apiWrapper } from "@/app/api/apiWrapper";
import { getNetworkInfo } from "@/app/api/getNetworkInfo";
import { HttpStatusCode } from "@/app/api/httpStatusCodes";
import { API_ENDPOINTS } from "@/app/constants/endpoints";
import { ServerError } from "@/app/context/Error/errors";

// Mock the apiWrapper module
jest.mock("@/app/api/apiWrapper");
// Mock the getPublicKeyNoCoord function
jest.mock("@babylonlabs-io/btc-staking-ts", () => ({
  getPublicKeyNoCoord: jest.fn((pk) => `no-coord-${pk}`),
}));

describe("getNetworkInfo", () => {
  // Create a mock successful response
  const mockSuccessResponse = {
    data: {
      staking_status: {
        is_staking_open: true,
      },
      params: {
        bbn: [
          {
            version: 0, // Genesis version
            covenant_pks: ["pk1", "pk2", "pk3"],
            covenant_quorum: 2,
            min_staking_value_sat: 100000,
            max_staking_value_sat: 1000000,
            min_staking_time_blocks: 144,
            max_staking_time_blocks: 1440,
            slashing_pk_script: "slashingScript",
            min_slashing_tx_fee_sat: 1000,
            slashing_rate: "0.1",
            unbonding_time_blocks: 144,
            unbonding_fee_sat: 2000,
            min_commission_rate: "0.05",
            max_active_finality_providers: 10,
            delegation_creation_base_gas_fee: 50000,
            btc_activation_height: 100,
            allow_list_expiration_height: 200,
          },
          {
            version: 1, // Latest version
            covenant_pks: ["pk4", "pk5", "pk6"],
            covenant_quorum: 3,
            min_staking_value_sat: 150000,
            max_staking_value_sat: 1500000,
            min_staking_time_blocks: 288,
            max_staking_time_blocks: 2880,
            slashing_pk_script: "slashingScript2",
            min_slashing_tx_fee_sat: 1500,
            slashing_rate: "0.15",
            unbonding_time_blocks: 288,
            unbonding_fee_sat: 3000,
            min_commission_rate: "0.1",
            max_active_finality_providers: 15,
            delegation_creation_base_gas_fee: 60000,
            btc_activation_height: 200,
            allow_list_expiration_height: 300,
          },
        ],
        btc: [
          {
            version: 0, // Genesis version
            btc_confirmation_depth: 6,
          },
          {
            version: 1, // Latest version
            btc_confirmation_depth: 12,
          },
        ],
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches network info successfully", async () => {
    // Mock the apiWrapper to return the successful response
    (apiWrapper as jest.Mock).mockResolvedValue({
      data: mockSuccessResponse,
    });

    // Call the function
    const result = await getNetworkInfo();

    // Verify apiWrapper was called with correct parameters
    expect(apiWrapper).toHaveBeenCalledWith(
      "GET",
      "/v2/network-info",
      "Error getting network info",
    );

    // Verify the result structure and transformation
    expect(result).toEqual({
      stakingStatus: {
        isStakingOpen: true,
      },
      params: {
        bbnStakingParams: {
          latestParam: expect.objectContaining({
            version: 1,
            covenantNoCoordPks: [
              "no-coord-pk4",
              "no-coord-pk5",
              "no-coord-pk6",
            ],
            covenantQuorum: 3,
            minStakingValueSat: 150000,
            maxStakingValueSat: 1500000,
            minStakingTimeBlocks: 288,
            maxStakingTimeBlocks: 2880,
            unbondingTime: 288,
            unbondingFeeSat: 3000,
            minCommissionRate: "0.1",
            maxActiveFinalityProviders: 15,
            delegationCreationBaseGasFee: 60000,
            slashing: {
              slashingPkScriptHex: "slashingScript2",
              slashingRate: 0.15,
              minSlashingTxFeeSat: 1500,
            },
            maxStakingAmountSat: 1500000,
            minStakingAmountSat: 150000,
            btcActivationHeight: 200,
            allowListExpirationHeight: 300,
          }),
          versions: expect.arrayContaining([
            expect.objectContaining({ version: 0 }),
            expect.objectContaining({ version: 1 }),
          ]),
          genesisParam: expect.objectContaining({
            version: 0,
            covenantNoCoordPks: [
              "no-coord-pk1",
              "no-coord-pk2",
              "no-coord-pk3",
            ],
            covenantQuorum: 2,
            minStakingValueSat: 100000,
            maxStakingValueSat: 1000000,
            minStakingTimeBlocks: 144,
            maxStakingTimeBlocks: 1440,
            unbondingTime: 144,
            unbondingFeeSat: 2000,
            minCommissionRate: "0.05",
            maxActiveFinalityProviders: 10,
            delegationCreationBaseGasFee: 50000,
            slashing: {
              slashingPkScriptHex: "slashingScript",
              slashingRate: 0.1,
              minSlashingTxFeeSat: 1000,
            },
            maxStakingAmountSat: 1000000,
            minStakingAmountSat: 100000,
            btcActivationHeight: 100,
            allowListExpirationHeight: 200,
          }),
        },
        btcEpochCheckParams: {
          latestParam: expect.objectContaining({
            version: 1,
            btcConfirmationDepth: 12,
          }),
          versions: expect.arrayContaining([
            expect.objectContaining({ version: 0, btcConfirmationDepth: 6 }),
            expect.objectContaining({ version: 1, btcConfirmationDepth: 12 }),
          ]),
          genesisParam: expect.objectContaining({
            version: 0,
            btcConfirmationDepth: 6,
          }),
        },
      },
    });
  });

  it("throws error when genesis staking params are missing", async () => {
    // Clone the success response
    const responseWithoutGenesis = JSON.parse(
      JSON.stringify(mockSuccessResponse),
    );
    // Remove the genesis version
    responseWithoutGenesis.data.params.bbn =
      responseWithoutGenesis.data.params.bbn.filter(
        (param: { version: number }) => param.version !== 0,
      );

    // Mock the apiWrapper to return the response without genesis params
    (apiWrapper as jest.Mock).mockResolvedValue({
      data: responseWithoutGenesis,
    });

    // Expect the function to throw an error
    await expect(getNetworkInfo()).rejects.toThrow(
      new ServerError({
        message: "Genesis staking params not found",
        status: HttpStatusCode.InternalServerError,
        endpoint: API_ENDPOINTS.NETWORK_INFO,
      }),
    );
  });

  it("throws error when genesis epoch check params are missing", async () => {
    // Clone the success response
    const responseWithoutGenesis = JSON.parse(
      JSON.stringify(mockSuccessResponse),
    );
    // Remove the genesis version from epoch check params
    responseWithoutGenesis.data.params.btc =
      responseWithoutGenesis.data.params.btc.filter(
        (param: { version: number }) => param.version !== 0,
      );

    // Mock the apiWrapper to return the response without genesis params
    (apiWrapper as jest.Mock).mockResolvedValue({
      data: responseWithoutGenesis,
    });

    // Expect the function to throw an error
    await expect(getNetworkInfo()).rejects.toThrow(
      new ServerError({
        message: "Genesis epoch check params not found",
        status: HttpStatusCode.InternalServerError,
        endpoint: API_ENDPOINTS.NETWORK_INFO,
      }),
    );
  });

  it("throws error when version and BTC activation height are inconsistently ordered", async () => {
    // Clone the success response
    const responseWithInconsistentOrdering = JSON.parse(
      JSON.stringify(mockSuccessResponse),
    );
    // Make the ordering inconsistent (version 1 has lower height than version 0)
    responseWithInconsistentOrdering.data.params.bbn[1].btc_activation_height = 50;

    // Mock the apiWrapper to return the response with inconsistent ordering
    (apiWrapper as jest.Mock).mockResolvedValue({
      data: responseWithInconsistentOrdering,
    });

    // Expect the function to throw an error
    await expect(getNetworkInfo()).rejects.toThrow(
      new ServerError({
        message:
          "Version numbers and BTC activation heights are not consistently ordered",
        status: HttpStatusCode.InternalServerError,
        endpoint: API_ENDPOINTS.NETWORK_INFO,
      }),
    );
  });

  it("throws error when apiWrapper fails", async () => {
    const mockError = new Error("API error");
    (apiWrapper as jest.Mock).mockRejectedValue(mockError);

    await expect(getNetworkInfo()).rejects.toThrow("API error");
  });
});

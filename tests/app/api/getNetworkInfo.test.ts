import { apiWrapper } from "@/ui/common/api/apiWrapper";
import { getNetworkInfo } from "@/ui/common/api/getNetworkInfo";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";

import { mockSuccessResponse } from "./getNetworkInfo.mocks";

// Mock the apiWrapper module
jest.mock("@/ui/common/api/apiWrapper");
// Mock the getPublicKeyNoCoord function
jest.mock("@babylonlabs-io/btc-staking-ts", () => ({
  getPublicKeyNoCoord: jest.fn((pk) => `no-coord-${pk}`),
}));

describe("getNetworkInfo", () => {
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
      networkUpgrade: undefined,
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
            maxFinalityProviders: 15,
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
            maxFinalityProviders: 10,
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

    await expect(getNetworkInfo()).rejects.toThrow(ClientError);
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

    await expect(getNetworkInfo()).rejects.toThrow(ClientError);
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

    await expect(getNetworkInfo()).rejects.toThrow(ClientError);
  });

  it("throws error when apiWrapper fails", async () => {
    const mockError = new ClientError(
      ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
      "API error",
    );
    (apiWrapper as jest.Mock).mockRejectedValue(mockError);

    await expect(getNetworkInfo()).rejects.toThrow("API error");
  });
});

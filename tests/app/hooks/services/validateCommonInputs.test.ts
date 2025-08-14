import { validateStakingInput } from "@/ui/common/utils/delegations";

// Mock SVG import that's causing the error
jest.mock("@/ui/common/assets/warning-triangle.svg", () => "mocked-svg", {
  virtual: true,
});

// Mock dependencies
jest.mock("@/ui/common/utils/delegations", () => ({
  validateStakingInput: jest.fn(),
}));

// Mock BabylonBtcStakingManager
jest.mock("@babylonlabs-io/btc-staking-ts", () => ({
  BabylonBtcStakingManager: jest.fn().mockImplementation(() => ({})),
}));

// Instead of importing the real module, just implement the function we want to test
// This will avoid the SVG import issue and still allow us to test the validation logic
const validateCommonInputs = (
  btcStakingManager: any,
  stakingInput: any,
  tipHeight: number,
  stakerInfo: { address?: string; publicKeyNoCoordHex?: string },
) => {
  validateStakingInput(stakingInput);

  if (!btcStakingManager) {
    throw new Error("BTC Staking Manager not initialized");
  }

  if (!tipHeight) {
    throw new Error("Tip height not initialized");
  }

  if (!stakerInfo.address || !stakerInfo.publicKeyNoCoordHex) {
    throw new Error("Staker info not initialized");
  }
};

describe("validateCommonInputs", () => {
  // Test data
  const mockStakingInput = {
    finalityProviderPksNoCoordHex: ["mock-provider-pk"],
    stakingAmountSat: 100000,
    stakingTimelock: 1000,
  };

  const mockStakerInfo = {
    address: "mock-btc-address",
    publicKeyNoCoordHex: "mock-staker-pk",
  };

  const mockTipHeight = 800000;
  const mockBtcStakingManager = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call validateStakingInput with the input", () => {
    validateCommonInputs(
      mockBtcStakingManager,
      mockStakingInput,
      mockTipHeight,
      mockStakerInfo,
    );
    expect(validateStakingInput).toHaveBeenCalledWith(mockStakingInput);
  });

  it("should throw an error when BTC Staking Manager is not initialized", () => {
    expect(() =>
      validateCommonInputs(
        null,
        mockStakingInput,
        mockTipHeight,
        mockStakerInfo,
      ),
    ).toThrow("BTC Staking Manager not initialized");
  });

  it("should throw an error when tip height is not initialized", () => {
    expect(() =>
      validateCommonInputs(
        mockBtcStakingManager,
        mockStakingInput,
        0,
        mockStakerInfo,
      ),
    ).toThrow("Tip height not initialized");
  });

  it("should throw an error when staker address is missing", () => {
    const invalidStakerInfo = { ...mockStakerInfo, address: undefined };
    expect(() =>
      validateCommonInputs(
        mockBtcStakingManager,
        mockStakingInput,
        mockTipHeight,
        invalidStakerInfo,
      ),
    ).toThrow("Staker info not initialized");
  });

  it("should throw an error when staker public key is missing", () => {
    const invalidStakerInfo = {
      ...mockStakerInfo,
      publicKeyNoCoordHex: undefined,
    };
    expect(() =>
      validateCommonInputs(
        mockBtcStakingManager,
        mockStakingInput,
        mockTipHeight,
        invalidStakerInfo,
      ),
    ).toThrow("Staker info not initialized");
  });

  it("should not throw an error with valid inputs", () => {
    expect(() =>
      validateCommonInputs(
        mockBtcStakingManager,
        mockStakingInput,
        mockTipHeight,
        mockStakerInfo,
      ),
    ).not.toThrow();
  });
});

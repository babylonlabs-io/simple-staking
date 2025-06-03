import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import Home from "@/app/page";

jest.mock("@uidotdev/usehooks", () => ({
  useDebounce: jest.fn((value) => value),
}));

jest.mock("@babylonlabs-io/btc-staking-ts", () => ({
  initBTCCurve: jest.fn(),
}));

jest.mock("@/utils/FeatureFlagService", () => ({
  __esModule: true,
  default: {
    get IsMultiStakingEnabled() {
      return this._isMultiStakingEnabled;
    },
    _isMultiStakingEnabled: false,
  },
}));

jest.mock(
  "@/app/components/Multistaking/MultistakingForm/MultistakingForm",
  () => ({
    MultistakingForm: () => (
      <div data-testid="multistaking-form">MultistakingForm</div>
    ),
  }),
);

jest.mock("@/app/components/Staking/StakingForm", () => ({
  StakingForm: () => <div data-testid="staking-form">StakingForm</div>,
}));

jest.mock("@/app/components/Delegations/Activity", () => ({
  Activity: () => null,
})); // Uses @uidotdev/usehooks
jest.mock("@/app/components/Header/Header", () => ({ Header: () => null })); // Uses @uidotdev/usehooks
jest.mock("@/app/components/PersonalBalance/PersonalBalance", () => ({
  PersonalBalance: () => null,
})); // Has API dependencies
jest.mock("@/app/components/Stats/Stats", () => ({ Stats: () => null })); // Has API dependencies
jest.mock("@/app/components/FAQ/FAQ", () => ({ FAQ: () => null })); // Uses ResizeObserver

describe("Home page feature flag – MULTISTAKING", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders MultistakingForm when FF_MULTISTAKING is enabled", () => {
    const FeatureFlagService = require("@/utils/FeatureFlagService").default;
    FeatureFlagService._isMultiStakingEnabled = true;

    const { getByTestId, queryByTestId } = render(<Home />);

    expect(getByTestId("multistaking-form")).toBeInTheDocument();
    expect(queryByTestId("staking-form")).not.toBeInTheDocument();
  });

  it("renders StakingForm when FF_MULTISTAKING is disabled", () => {
    const FeatureFlagService = require("@/utils/FeatureFlagService").default;
    FeatureFlagService._isMultiStakingEnabled = false;

    const { getByTestId, queryByTestId } = render(<Home />);

    expect(getByTestId("staking-form")).toBeInTheDocument();
    expect(queryByTestId("multistaking-form")).not.toBeInTheDocument();
  });
});

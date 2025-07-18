import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import Home from "@/ui/legacy/page";

jest.mock("@uidotdev/usehooks", () => ({
  useDebounce: jest.fn((value) => value),
}));

jest.mock("@babylonlabs-io/btc-staking-ts", () => ({
  initBTCCurve: jest.fn(),
}));

jest.mock("@/ui/legacy/utils/FeatureFlagService", () => ({
  __esModule: true,
  default: {
    get IsMultiStakingEnabled() {
      return this._isMultiStakingEnabled;
    },
    _isMultiStakingEnabled: false,
  },
}));

jest.mock(
  "@/ui/legacy/components/Multistaking/MultistakingForm/MultistakingForm",
  () => ({
    MultistakingForm: () => (
      <div data-testid="multistaking-form">MultistakingForm</div>
    ),
  }),
);

jest.mock("@/ui/legacy/components/Staking/StakingForm", () => ({
  StakingForm: () => <div data-testid="staking-form">StakingForm</div>,
}));

jest.mock("@/ui/legacy/components/Delegations/Activity", () => ({
  Activity: () => null,
})); // Uses @uidotdev/usehooks
jest.mock("@/ui/legacy/components/Header/Header", () => ({
  Header: () => null,
})); // Uses @uidotdev/usehooks
jest.mock("@/ui/legacy/components/PersonalBalance/PersonalBalance", () => ({
  PersonalBalance: () => null,
})); // Has API dependencies
jest.mock("@/ui/legacy/components/Stats/Stats", () => ({ Stats: () => null })); // Has API dependencies
jest.mock("@/ui/legacy/components/FAQ/FAQ", () => ({ FAQ: () => null })); // Uses ResizeObserver

describe("Home page feature flag – MULTISTAKING", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should render MultistakingForm", () => {
    const FeatureFlagService =
      require("@/ui/legacy/utils/FeatureFlagService").default;
    FeatureFlagService._isMultiStakingEnabled = true;

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>,
    );

    expect(getByTestId("multistaking-form")).toBeInTheDocument();
  });
});

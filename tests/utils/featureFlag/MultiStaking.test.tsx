import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import Home from "@/ui/common/page";

jest.mock("@uidotdev/usehooks", () => ({
  useDebounce: jest.fn((value) => value),
}));

jest.mock("@babylonlabs-io/btc-staking-ts", () => ({
  initBTCCurve: jest.fn(),
}));

jest.mock("@/ui/common/utils/FeatureFlagService", () => ({
  __esModule: true,
  default: {
    get IsMultiStakingEnabled() {
      return this._isMultiStakingEnabled;
    },
    _isMultiStakingEnabled: false,
  },
}));

jest.mock(
  "@/ui/common/components/Multistaking/MultistakingForm/MultistakingForm",
  () => ({
    MultistakingForm: () => (
      <div data-testid="multistaking-form">MultistakingForm</div>
    ),
  }),
);

jest.mock("@/ui/common/components/Staking/StakingForm", () => ({
  StakingForm: () => <div data-testid="staking-form">StakingForm</div>,
}));

jest.mock("@/ui/common/components/Delegations/Activity", () => ({
  Activity: () => null,
})); // Uses @uidotdev/usehooks
jest.mock("@/ui/common/components/Header/Header", () => ({
  Header: () => null,
})); // Uses @uidotdev/usehooks
jest.mock("@/ui/common/components/PersonalBalance/PersonalBalance", () => ({
  PersonalBalance: () => null,
})); // Has API dependencies
jest.mock("@/ui/common/components/Stats/Stats", () => ({ Stats: () => null })); // Has API dependencies
jest.mock("@/ui/common/components/FAQ/FAQ", () => ({ FAQ: () => null })); // Uses ResizeObserver

describe("Home page feature flag – MULTISTAKING", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should render MultistakingForm", () => {
    const FeatureFlagService =
      require("@/ui/common/utils/FeatureFlagService").default;
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

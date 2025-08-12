import { useWalletConnect } from "@babylonlabs-io/wallet-connector";

import { Container } from "@/ui/common/components/Container/Container";
import { Nav, NavItem } from "@/ui/common/components/Nav";
import { useAppState } from "@/ui/common/state";
import FF from "@/ui/common/utils/FeatureFlagService";

import { SmallLogo } from "../Logo/SmallLogo";
import { Connect } from "../Wallet/Connect";

export const Header = () => {
  const { open } = useWalletConnect();
  const { isLoading: loading } = useAppState();

  return (
    <header className="mb-20">
      <Container className="h-20 flex items-center justify-between relative">
        <div className="flex items-center">
          <SmallLogo />
        </div>

        {FF.IsBabyStakingEnabled && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Nav>
              <NavItem title="BTC Staking" to="/btc" />
              <NavItem title="BABY Staking" to="/baby" />
            </Nav>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Connect loading={loading} onConnect={open} />
        </div>
      </Container>
    </header>
  );
};

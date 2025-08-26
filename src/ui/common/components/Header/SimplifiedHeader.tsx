import FF from "@/ui/common/utils/FeatureFlagService";

import { Container } from "../Container/Container";
import { SmallLogo } from "../Logo/SmallLogo";
import { Nav } from "../Nav/Nav";
import { NavItem } from "../Nav/NavItem";

export const SimplifiedHeader = () => {
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
      </Container>
    </header>
  );
};

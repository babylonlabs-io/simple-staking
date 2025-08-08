import { Outlet } from "react-router";

import { DelegationState } from "@/ui/baby/state/DelegationState";
import { RewardState } from "@/ui/baby/state/RewardState";
import { StakingState } from "@/ui/baby/state/StakingState";
import { ValidatorState } from "@/ui/baby/state/ValidatorState";
import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { Content } from "@/ui/common/components/Content/Content";
import { Nav, NavItem } from "@/ui/common/components/Nav";

export default function BabyLayout() {
  return (
    <ValidatorState>
      <DelegationState>
        <StakingState>
          <RewardState>
            <Content>
              <AuthGuard>
                <Nav>
                  <NavItem title="Stake" to="/baby/staking" />
                  <NavItem title="Activity" to="/baby/activities" />
                  <NavItem title="Rewards" to="/baby/rewards" />
                </Nav>
              </AuthGuard>

              <div className="mt-10">
                <Outlet />
              </div>
            </Content>
          </RewardState>
        </StakingState>
      </DelegationState>
    </ValidatorState>
  );
}

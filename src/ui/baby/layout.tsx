import { Outlet } from "react-router";

import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { Content } from "@/ui/common/components/Content/Content";
import { Nav, NavItem } from "@/ui/common/components/Nav";

export default function BabyLayout() {
  return (
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
  );
}

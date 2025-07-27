import { Outlet } from "react-router";

import { Content } from "@/ui/common/components/Content/Content";
import { Nav, NavItem } from "@/ui/common/components/Nav";

export default function BabyLayout() {
  return (
    <Content>
      <Nav>
        <NavItem title="Stake" to="/baby/staking" />
        <NavItem title="Activity" to="/baby/activities" />
        <NavItem title="Rewards" to="/baby/rewards" />
      </Nav>

      <div className="mt-10">
        <Outlet />
      </div>
    </Content>
  );
}

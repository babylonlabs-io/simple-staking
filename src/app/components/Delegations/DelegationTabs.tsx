import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import { Delegations } from "@/app/components/Delegations/Delegations";
import { AuthGuard } from "@/components/common/AuthGuard";

export function DelegationTabs() {
  return (
    <AuthGuard>
      <Tabs>
        <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1">
          <div className="flex gap-2 mb-4">
            <h3 className="font-bold">Staking history</h3>

            <TabList className="flex gap-2">
              <Tab
                className="text-primary cursor-pointer"
                selectedClassName="border-b border-dashed border-primary"
              >
                Phase 1
              </Tab>
            </TabList>
          </div>

          <TabPanel>
            <Delegations />
          </TabPanel>
        </div>
      </Tabs>
    </AuthGuard>
  );
}

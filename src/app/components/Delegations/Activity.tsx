import { AuthGuard } from "@/components/common/AuthGuard";
import { DelegationList } from "@/components/delegations/DelegationList";

import { Delegations } from "./Delegations";

export function Activity() {
  return (
    <AuthGuard>
      <div>
        <Delegations />
        <DelegationList />
      </div>
    </AuthGuard>
  );
}

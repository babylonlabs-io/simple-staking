import { Heading } from "@babylonlabs-io/bbn-core-ui";

import { AuthGuard } from "@/components/common/AuthGuard";
import { DelegationList } from "@/components/delegations/DelegationList";

import { Delegations } from "./Delegations";

export function Activity() {
  return (
    <AuthGuard>
      <Heading as="h3" variant="h4" className="mb-8 text-primary-dark">
        Activity
      </Heading>
      <Delegations />
      <DelegationList />
    </AuthGuard>
  );
}

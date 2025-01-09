import { Section } from "@/app/components/Section/Section";
import { AuthGuard } from "@/components/common/AuthGuard";
import { DelegationList } from "@/components/delegations/DelegationList";

import { Delegations } from "./Delegations";

export function Activity() {
  return (
    <AuthGuard>
      <Section title="Activity">
        <Delegations />
        <DelegationList />
      </Section>
    </AuthGuard>
  );
}
